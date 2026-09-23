import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    ytgame?: {
      IN_PLAYABLES_ENV?: boolean;
      SDK_VERSION?: string;
      game?: {
        firstFrameReady?(): void;
        gameReady?(): void;
        saveData?(data: string): Promise<void>;
        loadData?(): Promise<string>;
      };
      system?: {
        getLanguage?(): Promise<string>;
        isAudioEnabled?(): boolean;
        onAudioEnabledChange?(callback: (enabled: boolean) => void): () => void;
        onPause?(callback: () => void): () => void;
        onResume?(callback: () => void): () => void;
      };
      engagement?: {
        sendScore?(score: { value: number }): Promise<void>;
        openYTContent?(content: { id: string; contentType?: 'VIDEO' | 'PLAYABLE' }): Promise<void>;
      };
      health?: {
        logError?(): void;
        logWarning?(): void;
      };
      ads?: {
        requestInterstitialAd?(): Promise<void>;
        requestRewardedAd?(rewardId: string): Promise<boolean>;
      };
    };
  }
}

export class YouTubePlayablesAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'youtube';

  readonly capabilities: PlatformCapabilities = {
    hasAds: true,
    hasRewardedAds: true,
    hasCloudSave: true,
    hasLeaderboards: true,
    hasSocialShare: false,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: true,
  };

  private get sdk() {
    return typeof window !== 'undefined' ? window.ytgame : undefined;
  }

  public isPlayablesEnv(): boolean {
    return Boolean(this.sdk?.IN_PLAYABLES_ENV);
  }

  async initialize(): Promise<void> {
    // Wait for ytgame global if script is still initializing
    if (typeof window !== 'undefined' && !window.ytgame) {
      await new Promise<void>((resolve) => {
        let attempts = 0;
        const check = () => {
          if (window.ytgame || attempts > 20) {
            resolve();
          } else {
            attempts++;
            setTimeout(check, 50);
          }
        };
        check();
      });
    }
  }

  notifyFirstFrameReady(): void {
    try {
      this.sdk?.game?.firstFrameReady?.();
    } catch {
      this.logError('Failed to invoke firstFrameReady');
    }
  }

  notifyGameReady(): void {
    try {
      this.sdk?.game?.gameReady?.();
    } catch {
      this.logError('Failed to invoke gameReady');
    }
  }

  isAudioEnabled(): boolean {
    try {
      if (this.isPlayablesEnv() && this.sdk?.system?.isAudioEnabled) {
        return this.sdk.system.isAudioEnabled() !== false;
      }
    } catch {
      this.logWarning('Failed reading isAudioEnabled');
    }
    return true;
  }

  onAudioEnabledChange(callback: (enabled: boolean) => void): () => void {
    try {
      if (this.isPlayablesEnv() && this.sdk?.system?.onAudioEnabledChange) {
        return this.sdk.system.onAudioEnabledChange(callback) || (() => {});
      }
    } catch {
      this.logWarning('Failed registering onAudioEnabledChange');
    }
    return () => {};
  }

  onPause(callback: () => void): () => void {
    try {
      if (this.isPlayablesEnv() && this.sdk?.system?.onPause) {
        return this.sdk.system.onPause(callback) || (() => {});
      }
    } catch {
      this.logWarning('Failed registering onPause');
    }
    return () => {};
  }

  onResume(callback: () => void): () => void {
    try {
      if (this.isPlayablesEnv() && this.sdk?.system?.onResume) {
        return this.sdk.system.onResume(callback) || (() => {});
      }
    } catch {
      this.logWarning('Failed registering onResume');
    }
    return () => {};
  }

  async saveData(data: string): Promise<void> {
    // Validation per YouTube Playables certification requirements
    if (typeof data !== 'string') {
      this.logWarning('saveData called with non-string data');
      return;
    }

    // 3 MiB size limit (3 * 1024 * 1024 bytes)
    const MAX_SIZE = 3 * 1024 * 1024;
    if (data.length * 2 > MAX_SIZE) {
      this.logError('saveData payload exceeds 3MiB limit');
      return;
    }

    if (this.isPlayablesEnv() && this.sdk?.game?.saveData) {
      try {
        await this.sdk.game.saveData(data);
      } catch (err) {
        this.logWarning('YouTube Playables saveData rejected');
      }
    } else {
      try {
        localStorage.setItem('otg_playables_save', data);
      } catch {
        // quota exceeded or private mode
      }
    }
  }

  async loadData(): Promise<string | null> {
    if (this.isPlayablesEnv() && this.sdk?.game?.loadData) {
      try {
        const raw = await this.sdk.game.loadData();
        return raw || null;
      } catch {
        this.logWarning('YouTube Playables loadData failed');
      }
    }
    return localStorage.getItem('otg_playables_save');
  }

  async sendScore(value: number): Promise<void> {
    const safeScore = Math.max(0, Math.min(Math.floor(value), Number.MAX_SAFE_INTEGER));
    if (this.isPlayablesEnv() && this.sdk?.engagement?.sendScore) {
      try {
        await this.sdk.engagement.sendScore({ value: safeScore });
      } catch {
        this.logWarning('YouTube Playables sendScore rejected');
      }
    }
  }

  async showInterstitial(): Promise<AdResult> {
    if (this.isPlayablesEnv() && this.sdk?.ads?.requestInterstitialAd) {
      try {
        await this.sdk.ads.requestInterstitialAd();
        return { shown: true };
      } catch (err) {
        this.logWarning('requestInterstitialAd error');
        return { shown: false, error: String(err) };
      }
    }
    return { shown: false };
  }

  async showRewarded(rewardId: string): Promise<AdResult> {
    if (this.isPlayablesEnv() && this.sdk?.ads?.requestRewardedAd) {
      try {
        const earned = await this.sdk.ads.requestRewardedAd(rewardId);
        return { shown: true, rewardEarned: Boolean(earned) };
      } catch (err) {
        this.logWarning('requestRewardedAd error');
        return { shown: false, rewardEarned: false, error: String(err) };
      }
    }
    // Standalone fallback: simulate rewarded ad resolution
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    if (this.isPlayablesEnv() && this.sdk?.system?.getLanguage) {
      try {
        const lang = await this.sdk.system.getLanguage();
        if (typeof lang === 'string' && lang) {
          return lang;
        }
      } catch {
        this.logWarning('getLanguage failed');
      }
    }
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }

  async openContent(id: string, type: 'VIDEO' | 'PLAYABLE' = 'VIDEO'): Promise<void> {
    if (!id) return;
    if (this.isPlayablesEnv() && this.sdk?.engagement?.openYTContent) {
      try {
        await this.sdk.engagement.openYTContent({ id, contentType: type });
      } catch {
        this.logWarning('openYTContent failed');
      }
    } else if (typeof window !== 'undefined') {
      window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
    }
  }

  logWarning(message?: string): void {
    if (message && typeof console !== 'undefined') {
      console.warn(`[YouTubePlayables] ${message}`);
    }
    try {
      this.sdk?.health?.logWarning?.();
    } catch {
      // Must never crash
    }
  }

  logError(message?: string): void {
    if (message && typeof console !== 'undefined') {
      console.error(`[YouTubePlayables] ${message}`);
    }
    try {
      this.sdk?.health?.logError?.();
    } catch {
      // Must never crash
    }
  }
}
