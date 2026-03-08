// Haptic feedback for mobile devices using Vibration API
export function hapticSave() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30]); // Short double pulse for save
    }
  } catch {}
}

export function hapticGoal() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([80, 30, 80, 30, 120]); // Strong triple pulse for goal
    }
  } catch {}
}

export function hapticStreak() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20, 10, 20, 10, 40]); // Rapid celebration
    }
  } catch {}
}

export function hapticPowerUp() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 100]); // Power-up activation
    }
  } catch {}
}

export function hapticTap() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(10); // Light tap
    }
  } catch {}
}
