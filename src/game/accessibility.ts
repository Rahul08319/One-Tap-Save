import { persistGameData } from './youtubePlayables';

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  leftHanded: boolean;
}

const KEY = 'otg_accessibility';
const defaults: AccessibilitySettings = { reducedMotion: false, highContrast: false, leftHanded: false };

export function getAccessibilitySettings(): AccessibilitySettings {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return defaults; }
}

export function saveAccessibilitySettings(settings: AccessibilitySettings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
  document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
  document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  window.dispatchEvent(new Event('otg-accessibility-change'));
  void persistGameData();
}
