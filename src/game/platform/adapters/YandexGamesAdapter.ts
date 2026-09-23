import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    YaGames?: {
      init(): Promise<{
        features?: {
          LoadingAPI?: { ready(): void };
        };
        environment: {
          i18n: { lang: string };
        };
        adv: {
          showFullscreenAdv(options: {
            callbacks?: {
              onClose?: (wasShown: boolean) => void;
              onError?: (error: unknown) => void;
            };
          }): void;
          showRewardedVideo(options: {
            callbacks?: {
              onOpen?: () => void;
              onRewarded?: () => void;
              onClose?: () => void;
              onError?: (error: unknown) => void;
            };
          }): void;
        };
        getPlayer(options?: { scopes?: boolean }): Promise<{
          setData(data: Record<string, unknown>, flush?: boolean): Promise<void>;
          getData(keys?: string[]): Promise<Record<string, unknown>>;
        }>;
        getLeaderboards(): Promise<{
          setLeaderboardScore(name: string, score: number): Promise<void>;
        }>;
      }>;
    };
  }
}

export class YandexGamesAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'yandex';

  readonly capabilities: PlatformCapabilities = {
    hasAds: true,
    hasRewardedAds: true,
    hasCloudSave: true,
    hasLeaderboards: true,
    hasSocialShare: false,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  private ysdk: any = null;
  private player: any = null;

  async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && window.YaGames) {
      try {
        this.ysdk = await window.YaGames.init();
        try {
          this.player = await this.ysdk.getPlayer({ scopes: false });
        } catch {
          // guest mode
        }
      } catch (e) {
        this.logWarning(`Yandex Games init failed: ${e}`);
      }
    }
  }

  notifyFirstFrameReady(): void {
    // YaGames uses ready() on gameReady
  }

  notifyGameReady(): void {
    this.ysdk?.features?.LoadingAPI?.ready?.();
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
    if (this.player?.setData) {
      try {
        await this.player.setData({ otg_save: data }, true);
        return;
      } catch (err) {
        this.logWarning(`Yandex player setData error: ${err}`);
      }
    }
    localStorage.setItem('otg_yandex_save', data);
  }

  async loadData(): Promise<string | null> {
    if (this.player?.getData) {
      try {
        const res = await this.player.getData(['otg_save']);
        if (typeof res?.otg_save === 'string') {
          return res.otg_save;
        }
      } catch (err) {
        this.logWarning(`Yandex player getData error: ${err}`);
      }
    }
    return localStorage.getItem('otg_yandex_save');
  }

  async sendScore(value: number): Promise<void> {
    if (this.ysdk?.getLeaderboards) {
      try {
        const lb = await this.ysdk.getLeaderboards();
        await lb.setLeaderboardScore('otg_saves', Math.floor(value));
      } catch (err) {
        this.logWarning(`Yandex leaderboard error: ${err}`);
      }
    }
  }

  async showInterstitial(): Promise<AdResult> {
    if (this.ysdk?.adv?.showFullscreenAdv) {
      return new Promise<AdResult>((resolve) => {
        this.ysdk.adv.showFullscreenAdv({
          callbacks: {
            onClose: (wasShown: boolean) => resolve({ shown: wasShown }),
            onError: (err: unknown) => resolve({ shown: false, error: String(err) }),
          },
        });
      });
    }
    return { shown: false };
  }

  async showRewarded(_rewardId: string): Promise<AdResult> {
    if (this.ysdk?.adv?.showRewardedVideo) {
      return new Promise<AdResult>((resolve) => {
        let earned = false;
        this.ysdk.adv.showRewardedVideo({
          callbacks: {
            onRewarded: () => {
              earned = true;
            },
            onClose: () => {
              resolve({ shown: true, rewardEarned: earned });
            },
            onError: (err: unknown) => {
              resolve({ shown: false, rewardEarned: false, error: String(err) });
            },
          },
        });
      });
    }
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    if (this.ysdk?.environment?.i18n?.lang) {
      return this.ysdk.environment.i18n.lang;
    }
    return typeof navigator !== 'undefined' ? navigator.language : 'ru-RU';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[YandexGames] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[YandexGames] ${msg}`);
  }
}
