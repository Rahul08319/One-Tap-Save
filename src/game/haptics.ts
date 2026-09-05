// Haptic feedback for mobile devices using Vibration API.
const HAPTICS_KEY = 'otg_haptics_enabled';

export function areHapticsEnabled() {
  return localStorage.getItem(HAPTICS_KEY) !== 'false';
}

export function setHapticsEnabled(enabled: boolean) {
  localStorage.setItem(HAPTICS_KEY, String(enabled));
}

function vibrate(pattern: VibratePattern) {
  try {
    if (areHapticsEnabled() && navigator.vibrate) navigator.vibrate(pattern);
  } catch {}
}

export function hapticSave() {
  vibrate([30, 20, 30]);
}

export function hapticGoal() {
  vibrate([80, 30, 80, 30, 120]);
}

export function hapticStreak() {
  vibrate([20, 10, 20, 10, 20, 10, 40]);
}

export function hapticPowerUp() {
  vibrate([50, 30, 100]);
}

export function hapticTap() {
  vibrate(10);
}
