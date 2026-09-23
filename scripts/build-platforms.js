import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const platformsDir = path.resolve(rootDir, 'dist-platforms');

const PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube Playables',
    headScript: '<script src="https://www.youtube.com/game_api/v1"></script>',
    extraFiles: {
      'CSP_HEADERS_README.md': `# YouTube Playables CSP Response Headers
Serve these headers with your index.html during certification:

default-src 'none'; script-src 'report-sample' 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.youtube.com/game_api/v0 https://www.youtube.com/game_api/v0/ https://www.youtube.com/game_api/v1 https://www.youtube.com/game_api/v1/; object-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data:; media-src 'self' blob:; font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' blob: data:; sandbox allow-pointer-lock allow-same-origin allow-scripts; base-uri 'self'; manifest-src 'self'; worker-src 'self' blob:
`
    }
  },
  {
    id: 'facebook',
    name: 'Facebook Instant Games',
    headScript: '<script src="https://connect.facebook.net/en_US/fbinstant.7.1.js"></script>',
    extraFiles: {
      'fbapp-config.json': JSON.stringify({
        instant_games: {
          platform_version: '7.1',
          orientation: 'portrait',
          navigation_menu_version: 'NAV_FLOATING'
        }
      }, null, 2)
    }
  },
  {
    id: 'poki',
    name: 'Poki',
    headScript: '<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>',
    extraFiles: {}
  },
  {
    id: 'crazygames',
    name: 'CrazyGames',
    headScript: '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>',
    extraFiles: {}
  },
  {
    id: 'yandex',
    name: 'Yandex Games',
    headScript: '<script src="https://yandex.ru/games/sdk/v2"></script>',
    extraFiles: {}
  },
  {
    id: 'gamedistribution',
    name: 'GameDistribution',
    headScript: '<script src="https://html5.api.gamedistribution.com/main.min.js"></script>',
    extraFiles: {}
  },
  {
    id: 'discord',
    name: 'Discord Activities',
    headScript: '<script>window.DISCORD_EMBEDDED_ACTIVITY = true;</script>',
    extraFiles: {}
  },
  {
    id: 'jiogames',
    name: 'JioGames',
    headScript: '<script src="https://jiogames.net/sdk/jiogames.js"></script>',
    extraFiles: {}
  },
  {
    id: 'y8',
    name: 'Y8',
    headScript: '<script src="https://cdn.y8.com/api/bi.min.js"></script>',
    extraFiles: {}
  },
  {
    id: 'lagged',
    name: 'Lagged',
    headScript: '<script src="https://lagged.com/api/v2/api.js"></script>',
    extraFiles: {}
  },
  {
    id: 'msstore',
    name: 'Microsoft Store PWA',
    headScript: '',
    extraFiles: {
      'manifest.json': JSON.stringify({
        name: 'One Tap Goalkeeper',
        short_name: 'OneTapSave',
        start_url: '/',
        display: 'standalone',
        background_color: '#08140e',
        theme_color: '#0066cc',
        orientation: 'portrait'
      }, null, 2)
    }
  },
  {
    id: 'quickgames',
    name: 'Huawei & Xiaomi Quick Games',
    headScript: '',
    extraFiles: {
      'manifest.json': JSON.stringify({
        package: 'com.onetap.goalkeeper',
        name: 'One Tap Goalkeeper',
        versionName: '1.0.0',
        versionCode: 1,
        minPlatformVersion: 1050,
        icon: '/favicon.ico',
        orientation: 'portrait'
      }, null, 2)
    }
  },
  {
    id: 'reddit',
    name: 'Reddit Games (Devvit)',
    headScript: '<script>window.REDDIT_DEVVIT = true;</script>',
    extraFiles: {}
  },
  {
    id: 'msn',
    name: 'MSN Games',
    headScript: '',
    extraFiles: {}
  }
];

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

export function buildPlatforms() {
  if (!fs.existsSync(distDir)) {
    console.error('Base dist/ folder not found. Please run "npm run build" first.');
    return;
  }

  if (!fs.existsSync(platformsDir)) {
    fs.mkdirSync(platformsDir, { recursive: true });
  }

  const baseIndexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

  console.log(`Exporting packages for ${PLATFORMS.length} platforms...`);

  for (const plat of PLATFORMS) {
    const targetDir = path.join(platformsDir, plat.id);
    copyFolderSync(distDir, targetDir);

    // Customize index.html
    let customizedHtml = baseIndexHtml;

    // Replace or inject script
    // If YouTube, ensure the script is first in head
    if (plat.id === 'youtube') {
      if (!customizedHtml.includes('youtube.com/game_api/v1')) {
        customizedHtml = customizedHtml.replace('<head>', `<head>\n    ${plat.headScript}`);
      }
    } else {
      // Remove YouTube script if targeting non-YouTube platform
      customizedHtml = customizedHtml.replace(/<script src="https:\/\/www\.youtube\.com\/game_api\/v1"><\/script>\s*/g, '');
      if (plat.headScript) {
        customizedHtml = customizedHtml.replace('<head>', `<head>\n    ${plat.headScript}`);
      }
    }

    fs.writeFileSync(path.join(targetDir, 'index.html'), customizedHtml, 'utf8');

    // Write extra files (manifests, CSP documentation, configs)
    for (const [filename, content] of Object.entries(plat.extraFiles)) {
      fs.writeFileSync(path.join(targetDir, filename), content, 'utf8');
    }

    console.log(`✓ Built ${plat.name} (${plat.id}) -> dist-platforms/${plat.id}`);
  }

  console.log('All platform builds successfully exported!');
}

buildPlatforms();
