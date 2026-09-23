import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    CrazyGames?: {
      SDK: {
        init(): Promise<void>;
        game: {
          loadingStart(): void;
          loadingStop(): void;
          gameplayStart(): void;
          gameplayStop(): void;
        };
        ad: {
          requestAd(type: 'midgame' | 'rewarded', callbacks?: {
            adStarted?: () => void;
            adFinished?: () => void;
            adError?: (error: unknown) => void;
          }): Promise<void>;
        };
        data?: {
          getItem(key: string): Promise<string | null>;
          setItem(key: string, value: string): Promise<void>;
        };
      };
    };
  }
}

export class CrazyGamesAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'crazygames';

  readonly capabilities: PlatformCapabilities = {
    hasAds: true,
    hasRewardedAds: true,
    hasCloudSave: true,
    hasLeaderboards: false,
    hasSocialShare: false,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  private get sdk() {
    return typeof window !== 'undefined' ? window.CrazyGames?.SDK : undefined;
  }

  async initialize(): Promise<void> {
    if (this.sdk) {
      try {
        this.sdk.game.loadingStart();
        await this.sdk.init();
      } catch (e) {
        this.logWarning(`CrazyGames SDK init error: ${e}`);
      }
    }
  }

  notifyFirstFrameReady(): void {
    // handled on gameReady
  }

  notifyGameReady(): void {
    this.sdk?.game.loadingStop();
  }

  notifyGameplayStart(): void {
    this.sdk?.game.gameplayStart();
  }

  notifyGameplayStop(): void {
    this.sdk?.game.gameplayStop();
  }

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
    if (this.sdk?.data?.setItem) {
      try {
        await this.sdk.data.setItem('otg_cg_save', data);
        return;
      } catch {
        // Fallback
      }
    }
    localStorage.setItem('otg_cg_save', data);
  }

  async loadData(): Promise<string | null> {
    if (this.sdk?.data?.getItem) {
      try {
        const val = await this.sdk.data.getItem('otg_cg_save');
        if (val) return val;
      } catch {
        // Fallback
      }
    }
    return localStorage.getItem('otg_cg_save');
  }

  async sendScore(_value: number): Promise<void> {
    // Not used directly in CrazyGames v3 core
  }

  async showInterstitial(): Promise<AdResult> {
    if (this.sdk?.ad?.requestAd) {
      return new Promise<AdResult>((resolve) => {
        this.notifyGameplayStop();
        this.sdk?.ad.requestAd('midgame', {
          adFinished: () => {
            this.notifyGameplayStart();
            resolve({ shown: true });
          },
          adError: (err) => {
            this.notifyGameplayStart();
            resolve({ shown: false, error: String(err) });
          },
        }).catch((err) => {
          this.notifyGameplayStart();
          resolve({ shown: false, error: String(err) });
        });
      });
    }
    return { shown: false };
  }

  async showRewarded(_rewardId: string): Promise<AdResult> {
    if (this.sdk?.ad?.requestAd) {
      return new Promise<AdResult>((resolve) => {
        this.notifyGameplayStop();
        this.sdk?.ad.requestAd('rewarded', {
          adFinished: () => {
            this.notifyGameplayStart();
            resolve({ shown: true, rewardEarned: true });
          },
          adError: (err) => {
            this.notifyGameplayStart();
            resolve({ shown: false, rewardEarned: false, error: String(err) });
          },
        }).catch((err) => {
          this.notifyGameplayStart();
          resolve({ shown: false, rewardEarned: false, error: String(err) });
        });
      });
    }
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[CrazyGames] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[CrazyGames] ${msg}`);
  }
}
