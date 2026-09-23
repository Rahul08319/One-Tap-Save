import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    JioGames?: {
      init?(config: Record<string, unknown>): void;
      postScore?(score: number): void;
      showAd?(callbacks?: { onAdClosed?: () => void; onAdError?: () => void }): void;
      showRewardedAd?(callbacks?: { onRewarded?: () => void; onAdClosed?: () => void }): void;
    };
  }
}

export class JioGamesAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'jiogames';

  readonly capabilities: PlatformCapabilities = {
    hasAds: true,
    hasRewardedAds: true,
    hasCloudSave: true,
    hasLeaderboards: true,
    hasSocialShare: false,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  private get jio() {
    return typeof window !== 'undefined' ? window.JioGames : undefined;
  }

  async initialize(): Promise<void> {
    try {
      this.jio?.init?.({ gameName: 'One Tap Goalkeeper' });
    } catch (e) {
      this.logWarning(`JioGames init error: ${e}`);
    }
  }

  notifyFirstFrameReady(): void {}
  notifyGameReady(): void {}\n
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
    localStorage.setItem('otg_jiogames_save', data);
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem('otg_jiogames_save');
  }

  async sendScore(value: number): Promise<void> {
    this.jio?.postScore?.(Math.floor(value));
  }

  async showInterstitial(): Promise<AdResult> {
    if (this.jio?.showAd) {
      return new Promise<AdResult>((resolve) => {
        this.jio?.showAd?.({
          onAdClosed: () => resolve({ shown: true }),
          onAdError: () => resolve({ shown: false }),
        });
      });
    }
    return { shown: false };
  }

  async showRewarded(_rewardId: string): Promise<AdResult> {
    if (this.jio?.showRewardedAd) {
      return new Promise<AdResult>((resolve) => {
        let rewarded = false;
        this.jio?.showRewardedAd?.({
          onRewarded: () => {
            rewarded = true;
          },
          onAdClosed: () => {
            resolve({ shown: true, rewardEarned: rewarded });
          },
        });
      });
    }
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-IN';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[JioGames] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[JioGames] ${msg}`);
  }
}
