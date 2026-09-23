import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    qg?: {
      getSystemInfoSync?(): { language?: string };
      setStorage?(options: { key: string; data: string; success?: () => void }): void;
      getStorage?(options: { key: string; success?: (res: { data: string }) => void }): void;
      createInterstitialAd?(options: { adUnitId: string }): {
        load(): Promise<void>;
        show(): Promise<void>;
      };
      createRewardedVideoAd?(options: { adUnitId: string }): {
        load(): Promise<void>;
        show(): Promise<void>;
        onClose(cb: (res: { isEnded: boolean }) => void): void;
      };
    };
  }
}

export class QuickGamesAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'quickgames';

  readonly capabilities: PlatformCapabilities = {
    hasAds: true,
    hasRewardedAds: true,
    hasCloudSave: true,
    hasLeaderboards: false,
    hasSocialShare: false,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  private get qg() {
    return typeof window !== 'undefined' ? window.qg : undefined;
  }

  async initialize(): Promise<void> {}
  notifyFirstFrameReady(): void {}
  notifyGameReady(): void {}

  isAudioEnabled(): boolean {
    return true;
  }

  onAudioEnabledChange(_callback: (enabled: boolean) => void): () => void {
    return () => {};
  }

  onPause(callback: () => void): () => void {
    const handleVis = () => {
      if (document.hidden) callback();
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }

  onResume(callback: () => void): () => void {
    const handleVis = () => {
      if (!document.hidden) callback();
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }

  async saveData(data: string): Promise<void> {
    if (this.qg?.setStorage) {
      this.qg.setStorage({ key: 'otg_qg_save', data });
      return;
    }
    localStorage.setItem('otg_qg_save', data);
  }

  async loadData(): Promise<string | null> {
    if (this.qg?.getStorage) {
      return new Promise<string | null>((resolve) => {
        this.qg?.getStorage?.({
          key: 'otg_qg_save',
          success: (res) => resolve(res.data || null),
        });
      });
    }
    return localStorage.getItem('otg_qg_save');
  }

  async sendScore(_value: number): Promise<void> {}

  async showInterstitial(): Promise<AdResult> {
    if (this.qg?.createInterstitialAd) {
      try {
        const ad = this.qg.createInterstitialAd({ adUnitId: 'default_interstitial' });
        await ad.load();
        await ad.show();
        return { shown: true };
      } catch (err) {
        return { shown: false, error: String(err) };
      }
    }
    return { shown: false };
  }

  async showRewarded(_rewardId: string): Promise<AdResult> {
    if (this.qg?.createRewardedVideoAd) {
      return new Promise<AdResult>((resolve) => {
        try {
          const ad = this.qg!.createRewardedVideoAd!({ adUnitId: 'default_rewarded' });
          ad.onClose((res) => {
            resolve({ shown: true, rewardEarned: res.isEnded });
          });
          ad.load().then(() => ad.show()).catch((err) => {
            resolve({ shown: false, rewardEarned: false, error: String(err) });
          });
        } catch (err) {
          resolve({ shown: false, rewardEarned: false, error: String(err) });
        }
      });
    }
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    const sys = this.qg?.getSystemInfoSync?.();
    if (sys?.language) return sys.language;
    return typeof navigator !== 'undefined' ? navigator.language : 'zh-CN';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[QuickGames] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[QuickGames] ${msg}`);
  }
}
