import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    gdsdk?: {
      showAd(type?: string): Promise<void>;
    };
    GD_OPTIONS?: {
      gameId: string;
      onEvent(event: { name: string; message?: string }): void;
    };
  }
}

export class GameDistributionAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'gamedistribution';

  readonly capabilities: PlatformCapabilities = {
    hasAds: true,
    hasRewardedAds: true,
    hasCloudSave: false,
    hasLeaderboards: false,
    hasSocialShare: false,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  private pauseCallbacks: Array<() => void> = [];
  private resumeCallbacks: Array<() => void> = [];

  async initialize(): Promise<void> {
    if (typeof window !== 'undefined') {
      window.GD_OPTIONS = {
        gameId: 'otg_game_id',
        onEvent: (event) => {
          switch (event.name) {
            case 'SDK_GAME_PAUSE':
              this.pauseCallbacks.forEach((cb) => cb());
              break;
            case 'SDK_GAME_START':
              this.resumeCallbacks.forEach((cb) => cb());
              break;
            case 'SDK_ERROR':
              this.logWarning(`GD SDK Error: ${event.message}`);
              break;
          }
        },
      };
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

  onPause(callback: () => void): () => void {
    this.pauseCallbacks.push(callback);
    return () => {
      this.pauseCallbacks = this.pauseCallbacks.filter((c) => c !== callback);
    };
  }

  onResume(callback: () => void): () => void {
    this.resumeCallbacks.push(callback);
    return () => {
      this.resumeCallbacks = this.resumeCallbacks.filter((c) => c !== callback);
    };
  }

  async saveData(data: string): Promise<void> {
    localStorage.setItem('otg_gd_save', data);
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem('otg_gd_save');
  }

  async sendScore(_value: number): Promise<void> {}

  async showInterstitial(): Promise<AdResult> {
    if (typeof window !== 'undefined' && window.gdsdk?.showAd) {
      try {
        await window.gdsdk.showAd();
        return { shown: true };
      } catch (err) {
        return { shown: false, error: String(err) };
      }
    }
    return { shown: false };
  }

  async showRewarded(_rewardId: string): Promise<AdResult> {
    if (typeof window !== 'undefined' && window.gdsdk?.showAd) {
      try {
        await window.gdsdk.showAd('rewarded');
        return { shown: true, rewardEarned: true };
      } catch (err) {
        return { shown: false, rewardEarned: false, error: String(err) };
      }
    }
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[GameDistribution] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[GameDistribution] ${msg}`);
  }
}
