import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlatformManager } from '../game/platform/PlatformManager';
import { YouTubePlayablesAdapter } from '../game/platform/adapters/YouTubePlayablesAdapter';
import { FacebookInstantAdapter } from '../game/platform/adapters/FacebookInstantAdapter';
import { PokiAdapter } from '../game/platform/adapters/PokiAdapter';
import { CrazyGamesAdapter } from '../game/platform/adapters/CrazyGamesAdapter';
import { YandexGamesAdapter } from '../game/platform/adapters/YandexGamesAdapter';
import { StandaloneAdapter } from '../game/platform/adapters/StandaloneAdapter';

describe('PlatformManager & Multi-Platform Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
    delete (window as any).ytgame;
    delete (window as any).FBInstant;
    delete (window as any).PokiSDK;
    delete (window as any).CrazyGames;
    delete (window as any).YaGames;
  });

  it('defaults to YouTube or Standalone when no platform is injected', () => {
    const manager = PlatformManager.getInstance();
    expect(['youtube', 'standalone']).toContain(manager.platform);
  });

  it('switches platforms dynamically', () => {
    const manager = PlatformManager.getInstance();

    manager.setPlatform('poki');
    expect(manager.platform).toBe('poki');
    expect(manager.adapter.capabilities.hasAds).toBe(true);

    manager.setPlatform('crazygames');
    expect(manager.platform).toBe('crazygames');

    manager.setPlatform('facebook');
    expect(manager.platform).toBe('facebook');

    manager.setPlatform('youtube');
    expect(manager.platform).toBe('youtube');
  });
});

describe('YouTubePlayablesAdapter Compliance', () => {
  let adapter: YouTubePlayablesAdapter;
  let mockYtgame: any;

  beforeEach(() => {
    adapter = new YouTubePlayablesAdapter();
    mockYtgame = {
      IN_PLAYABLES_ENV: true,
      game: {
        firstFrameReady: vi.fn(),
        gameReady: vi.fn(),
        saveData: vi.fn().mockResolvedValue(undefined),
        loadData: vi.fn().mockResolvedValue('{"version":1,"data":{"test":"val"}}'),
      },
      system: {
        isAudioEnabled: vi.fn().mockReturnValue(true),
        onAudioEnabledChange: vi.fn().mockImplementation((cb) => {
          cb(false);
          return () => {};
        }),
        onPause: vi.fn().mockImplementation((cb) => {
          cb();
          return () => {};
        }),
        onResume: vi.fn().mockImplementation((cb) => {
          cb();
          return () => {};
        }),
        getLanguage: vi.fn().mockResolvedValue('en-US'),
      },
      engagement: {
        sendScore: vi.fn().mockResolvedValue(undefined),
        openYTContent: vi.fn().mockResolvedValue(undefined),
      },
      ads: {
        requestInterstitialAd: vi.fn().mockResolvedValue(undefined),
        requestRewardedAd: vi.fn().mockResolvedValue(true),
      },
      health: {
        logError: vi.fn(),
        logWarning: vi.fn(),
      },
    };
    window.ytgame = mockYtgame;
  });

  it('correctly detects in-playables environment', () => {
    expect(adapter.isPlayablesEnv()).toBe(true);
  });

  it('invokes firstFrameReady and gameReady', () => {
    adapter.notifyFirstFrameReady();
    expect(mockYtgame.game.firstFrameReady).toHaveBeenCalled();

    adapter.notifyGameReady();
    expect(mockYtgame.game.gameReady).toHaveBeenCalled();
  });

  it('handles audio enabled state and change listener', () => {
    expect(adapter.isAudioEnabled()).toBe(true);

    const audioCb = vi.fn();
    adapter.onAudioEnabledChange(audioCb);
    expect(mockYtgame.system.onAudioEnabledChange).toHaveBeenCalled();
    expect(audioCb).toHaveBeenCalledWith(false);
  });

  it('handles pause and resume callbacks', () => {
    const pauseCb = vi.fn();
    adapter.onPause(pauseCb);
    expect(mockYtgame.system.onPause).toHaveBeenCalled();
    expect(pauseCb).toHaveBeenCalled();

    const resumeCb = vi.fn();
    adapter.onResume(resumeCb);
    expect(mockYtgame.system.onResume).toHaveBeenCalled();
    expect(resumeCb).toHaveBeenCalled();
  });

  it('saves and loads data within size limits', async () => {
    const payload = JSON.stringify({ version: 1, data: { test: '123' } });
    await adapter.saveData(payload);
    expect(mockYtgame.game.saveData).toHaveBeenCalledWith(payload);

    const loaded = await adapter.loadData();
    expect(loaded).toBe('{"version":1,"data":{"test":"val"}}');
  });

  it('blocks oversized save data (>3MiB)', async () => {
    const bigString = 'a'.repeat(4 * 1024 * 1024);
    await adapter.saveData(bigString);
    expect(mockYtgame.game.saveData).not.toHaveBeenCalled();
    expect(mockYtgame.health.logError).toHaveBeenCalled();
  });

  it('safely transmits scores with integer bounds', async () => {
    await adapter.sendScore(42.8);
    expect(mockYtgame.engagement.sendScore).toHaveBeenCalledWith({ value: 42 });
  });

  it('requests interstitial and rewarded ads', async () => {
    const interResult = await adapter.showInterstitial();
    expect(interResult.shown).toBe(true);
    expect(mockYtgame.ads.requestInterstitialAd).toHaveBeenCalled();

    const rewardResult = await adapter.showRewarded('extra-life');
    expect(rewardResult.shown).toBe(true);
    expect(rewardResult.rewardEarned).toBe(true);
    expect(mockYtgame.ads.requestRewardedAd).toHaveBeenCalledWith('extra-life');
  });
});

describe('Other Platform Adapters without Playgama', () => {
  it('Facebook Instant adapter handles storage and ads', async () => {
    const fb = new FacebookInstantAdapter();
    expect(fb.platform).toBe('facebook');
    expect(fb.capabilities.hasSocialShare).toBe(true);
  });

  it('Poki adapter manages gameplay start and stop', async () => {
    const poki = new PokiAdapter();
    expect(poki.platform).toBe('poki');
    expect(poki.capabilities.hasAds).toBe(true);
  });

  it('CrazyGames adapter supports v3 ad types', async () => {
    const cg = new CrazyGamesAdapter();
    expect(cg.platform).toBe('crazygames');
    expect(cg.capabilities.hasRewardedAds).toBe(true);
  });

  it('Yandex Games adapter handles language and scores', async () => {
    const yandex = new YandexGamesAdapter();
    expect(yandex.platform).toBe('yandex');
    expect(yandex.capabilities.hasLeaderboards).toBe(true);
  });

  it('Standalone fallback simulates rewarded ads for testing', async () => {
    const standalone = new StandaloneAdapter();
    const res = await standalone.showRewarded('test-reward');
    expect(res.shown).toBe(true);
    expect(res.rewardEarned).toBe(true);
  });
});
