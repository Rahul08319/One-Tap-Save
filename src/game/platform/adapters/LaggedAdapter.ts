import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    LaggedAPI?: {
      init(devId: string, pubId: string): void;
      Scores: {
        save(score: { score: number; board: string }): void;
      };
      Ads: {
        show(type: string, callback?: () => void): void;
      };
    };
  }
}

export class LaggedAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'lagged';

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
    if (typeof window !== 'undefined' && window.LaggedAPI) {
      try {
        window.LaggedAPI.init('otg_dev', 'otg_pub');
      } catch (e) {
        this.logWarning(`LaggedAPI init error: ${e}`);
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
    localStorage.setItem('otg_lagged_save', data);
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem('otg_lagged_save');
  }

  async sendScore(value: number): Promise<void> {
    if (typeof window !== 'undefined' && window.LaggedAPI?.Scores) {
      window.LaggedAPI.Scores.save({ score: Math.floor(value), board: 'otg_leaderboard' });
    }
  }

  async showInterstitial(): Promise<AdResult> {
    if (typeof window !== 'undefined' && window.LaggedAPI?.Ads) {
      return new Promise<AdResult>((resolve) => {
        window.LaggedAPI?.Ads.show('interstitial', () => resolve({ shown: true }));
      });
    }
    return { shown: false };
  }

  async showRewarded(_rewardId: string): Promise<AdResult> {
    if (typeof window !== 'undefined' && window.LaggedAPI?.Ads) {
      return new Promise<AdResult>((resolve) => {
        window.LaggedAPI?.Ads.show('rewarded', () => resolve({ shown: true, rewardEarned: true }));
      });
    }
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[Lagged] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[Lagged] ${msg}`);
  }
}
