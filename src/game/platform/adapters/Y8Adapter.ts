import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    ID?: {
      init(config: { appId: string }): void;
      GameBreak(callback: () => void): void;
      CustomEvents?: {
        event(name: string, data?: unknown): void;
      };
    };
  }
}

export class Y8Adapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'y8';

  readonly capabilities: PlatformCapabilities = {
    hasAds: true,
    hasRewardedAds: true,
    hasCloudSave: false,
    hasLeaderboards: true,
    hasSocialShare: false,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && window.ID?.init) {
      try {
        window.ID.init({ appId: 'otg_app_id' });
      } catch (e) {
        this.logWarning(`Y8 init error: ${e}`);
      }
    }
  }

  notifyFirstFrameReady(): void {}
  notifyGameReady(): void {}

  isAudioEnabled(): boolean {
    return true;
  }

  onAudioEnabledChange(_callback: (enabled: boolean) => void): () => void {
    return () => {};
  }

  onPause(_callback: () => void): () => void {
    return () => {};
  }

  onResume(_callback: () => void): () => void {
    return () => {};
  }

  async saveData(data: string): Promise<void> {
    localStorage.setItem('otg_y8_save', data);
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem('otg_y8_save');
  }

  async sendScore(value: number): Promise<void> {
    if (typeof window !== 'undefined' && window.ID?.CustomEvents) {
      window.ID.CustomEvents.event('score', { value: Math.floor(value) });
    }
  }

  async showInterstitial(): Promise<AdResult> {
    if (typeof window !== 'undefined' && window.ID?.GameBreak) {
      return new Promise<AdResult>((resolve) => {
        window.ID?.GameBreak(() => {
          resolve({ shown: true });
        });
      });
    }
    return { shown: false };
  }

  async showRewarded(_rewardId: string): Promise<AdResult> {
    if (typeof window !== 'undefined' && window.ID?.GameBreak) {
      return new Promise<AdResult>((resolve) => {
        window.ID?.GameBreak(() => {
          resolve({ shown: true, rewardEarned: true });
        });
      });
    }
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[Y8SDK] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[Y8SDK] ${msg}`);
  }
}
