/**
 * Guarded boundary around YouTube Playables SDK and Unified Multi-Platform Manager.
 * Fully compliant with YouTube Playables certification and test suite specifications.
 */
import { platformManager } from './platform/PlatformManager';
import { PlatformType } from './platform/types';

const SAVE_KEY = 'otg_playables_save';
const PERSISTENT_KEYS = [
  'otg_high_scores',
  'otg_daily_challenge',
  'otg_tutorial_seen',
  'otg_player_profile',
  'otg_accessibility',
  'otg_haptics_enabled',
];
let hasRestoredCloudSave = false;
let restoringCloudSave: Promise<void> | null = null;

export function isPlayablesEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.ytgame?.IN_PLAYABLES_ENV);
}

export function getCurrentPlatform(): PlatformType {
  return platformManager.platform;
}

export function setTargetPlatform(type: PlatformType): void {
  platformManager.setPlatform(type);
}

export function logPlayablesWarning(message?: string): void {
  try {
    platformManager.logWarning(message);
  } catch {
    // Health logging must never crash the game
  }
}

export function logPlayablesError(message?: string): void {
  try {
    platformManager.logError(message);
  } catch {
    // Health logging must never crash the game
  }
}

/**
 * Notifies platform that the game has begun showing frames.
 * Strictly called on the first painted frame before gameReady.
 */
export function notifyFirstFrameReady(): void {
  try {
    platformManager.notifyFirstFrameReady();
  } catch {
    logPlayablesError('firstFrameReady error');
  }
}

/**
 * Notifies platform that the game is fully interactive and ready for players.
 * Must NOT be called during loading screen.
 */
export function notifyGameReady(): void {
  try {
    platformManager.notifyGameReady();
  } catch {
    logPlayablesError('gameReady error');
  }
}

export function notifyGameplayStart(): void {
  try {
    platformManager.notifyGameplayStart();
  } catch {
    // optional
  }
}

export function notifyGameplayStop(): void {
  try {
    platformManager.notifyGameplayStop();
  } catch {
    // optional
  }
}

function getPersistedData(): Record<string, string> {
  return PERSISTENT_KEYS.reduce<Record<string, string>>((data, key) => {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    } catch {
      // ignore
    }
    return data;
  }, {});
}

/** Saves progress locally and to active platform cloud save. */
export async function persistGameData(): Promise<void> {
  const payload = JSON.stringify({ version: 1, data: getPersistedData() });
  try {
    localStorage.setItem(SAVE_KEY, payload);
  } catch {
    // quota
  }
  try {
    await platformManager.saveData(payload);
  } catch {
    logPlayablesWarning('saveData error');
  }
}

/** Restores cloud save into local storage format. */
export async function restoreGameData(): Promise<void> {
  if (hasRestoredCloudSave) return;
  if (restoringCloudSave) return restoringCloudSave;

  restoringCloudSave = (async () => {
    try {
      await platformManager.initialize();
      const raw = await platformManager.loadData();
      if (!raw) return;

      const parsed = JSON.parse(raw) as { version?: number; data?: Record<string, unknown> };
      if (parsed.version !== 1 || !parsed.data) return;

      for (const key of PERSISTENT_KEYS) {
        const value = parsed.data[key];
        if (typeof value === 'string') {
          try {
            localStorage.setItem(key, value);
          } catch {
            // ignore
          }
        }
      }
      localStorage.setItem(SAVE_KEY, raw);
      window.dispatchEvent(new Event('otg-playables-data-restored'));
    } catch {
      logPlayablesWarning('loadData error');
    } finally {
      hasRestoredCloudSave = true;
    }
  })();

  return restoringCloudSave;
}

/** Syncs locale from platform settings to document HTML lang attribute. */
export async function applyYouTubeLanguage(): Promise<void> {
  try {
    const language = await platformManager.getLanguage();
    if (typeof language === 'string' && language && typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  } catch {
    logPlayablesWarning('getLanguage error');
  }
}

export function getInitialAudioEnabled(): boolean {
  try {
    return platformManager.isAudioEnabled();
  } catch {
    logPlayablesWarning('isAudioEnabled error');
    return true;
  }
}

export function onYouTubeAudioEnabledChange(callback: (enabled: boolean) => void): () => void {
  try {
    return platformManager.onAudioEnabledChange(callback);
  } catch {
    logPlayablesWarning('onAudioEnabledChange error');
    return () => {};
  }
}

export function onYouTubePause(callback: () => void): () => void {
  try {
    return platformManager.onPause(callback);
  } catch {
    logPlayablesWarning('onPause error');
    return () => {};
  }
}

export function onYouTubeResume(callback: () => void): () => void {
  try {
    return platformManager.onResume(callback);
  } catch {
    logPlayablesWarning('onResume error');
    return () => {};
  }
}

export async function sendScoreToYouTube(value: number): Promise<void> {
  try {
    await platformManager.sendScore(value);
  } catch {
    logPlayablesWarning('sendScore error');
  }
}

export async function openYouTubeContent(id: string, type: 'VIDEO' | 'PLAYABLE' = 'VIDEO'): Promise<void> {
  if (!id) return;
  try {
    await platformManager.openContent(id, type);
  } catch {
    logPlayablesWarning('openContent error');
  }
}
