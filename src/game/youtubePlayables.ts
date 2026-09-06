/** A guarded boundary around the YouTube Playables SDK. */
declare global {
  interface Window { ytgame?: any; }
  interface Window {
    render_game_to_text?: () => string;
  }
}

const SAVE_KEY = 'otg_playables_save';
const PERSISTENT_KEYS = ['otg_high_scores', 'otg_daily_challenge', 'otg_tutorial_seen'];
let hasRestoredCloudSave = false;
let restoringCloudSave: Promise<void> | null = null;

function sdk() { return window.ytgame; }

export function isPlayablesEnvironment() { return Boolean(sdk()?.IN_PLAYABLES_ENV); }

export function logPlayablesWarning() {
  try { sdk()?.health?.logWarning?.(); } catch { /* reporting must never interrupt play */ }
}

export function logPlayablesError() {
  try { sdk()?.health?.logError?.(); } catch { /* reporting must never interrupt play */ }
}

export function notifyFirstFrameReady() {
  try { sdk()?.game?.firstFrameReady?.(); } catch { logPlayablesError(); }
}

export function notifyGameReady() {
  try { sdk()?.game?.gameReady?.(); } catch { logPlayablesError(); }
}

function getPersistedData() {
  return PERSISTENT_KEYS.reduce<Record<string, string>>((data, key) => {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
    return data;
  }, {});
}

/** Saves existing local progress locally and, on YouTube, to cloud save. */
export async function persistGameData() {
  if (!isPlayablesEnvironment()) {
    const data = JSON.stringify({ version: 1, data: getPersistedData() });
    localStorage.setItem(SAVE_KEY, data);
    return;
  }
  await restoreGameData();
  const data = JSON.stringify({ version: 1, data: getPersistedData() });
  try { await sdk()?.game?.saveData?.(data); } catch { logPlayablesWarning(); }
}

/** Restores YouTube cloud save into the game's existing local-storage format. */
export async function restoreGameData() {
  if (hasRestoredCloudSave || !isPlayablesEnvironment()) return;
  if (restoringCloudSave) return restoringCloudSave;
  restoringCloudSave = (async () => {
    try {
      const raw = await sdk()?.game?.loadData?.();
      if (!raw) return;
      const parsed = JSON.parse(raw) as { version?: number; data?: Record<string, unknown> };
      if (parsed.version !== 1 || !parsed.data) return;
      for (const key of PERSISTENT_KEYS) {
        const value = parsed.data[key];
        if (typeof value === 'string') localStorage.setItem(key, value);
      }
      localStorage.setItem(SAVE_KEY, raw);
    } catch { logPlayablesWarning(); }
    finally { hasRestoredCloudSave = true; }
  })();
  return restoringCloudSave;
}

export async function applyYouTubeLanguage() {
  if (!isPlayablesEnvironment()) return;
  try {
    const language = await sdk()?.system?.getLanguage?.();
    if (typeof language === 'string' && language) document.documentElement.lang = language;
  } catch { logPlayablesWarning(); }
}

export function getInitialAudioEnabled() {
  try { return !isPlayablesEnvironment() || sdk()?.system?.isAudioEnabled?.() !== false; }
  catch { logPlayablesWarning(); return true; }
}

export function onYouTubeAudioEnabledChange(callback: (enabled: boolean) => void) {
  if (!isPlayablesEnvironment()) return () => {};
  try { return sdk()?.system?.onAudioEnabledChange?.(callback) ?? (() => {}); }
  catch { logPlayablesWarning(); return () => {}; }
}

export function onYouTubePause(callback: () => void) {
  if (!isPlayablesEnvironment()) return () => {};
  try { return sdk()?.system?.onPause?.(callback) ?? (() => {}); }
  catch { logPlayablesWarning(); return () => {}; }
}

export function onYouTubeResume(callback: () => void) {
  if (!isPlayablesEnvironment()) return () => {};
  try { return sdk()?.system?.onResume?.(callback) ?? (() => {}); }
  catch { logPlayablesWarning(); return () => {}; }
}

export async function sendScoreToYouTube(value: number) {
  if (!isPlayablesEnvironment()) return;
  try { await sdk()?.engagement?.sendScore?.({ value: Math.max(0, Math.floor(value)) }); }
  catch { logPlayablesWarning(); }
}

// Deliberately opt-in: configure a valid related video/playable ID before calling it.
export async function openYouTubeContent(id: string) {
  if (!isPlayablesEnvironment() || !id) return;
  try { await sdk()?.engagement?.openYTContent?.({ id }); }
  catch { logPlayablesWarning(); }
}
