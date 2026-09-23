import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    FBInstant?: {
      initializeAsync(): Promise<void>;
      setLoadingProgress(percentage: number): void;
      startGameAsync(): Promise<void>;
      getLocale(): string;
      player: {
        getID(): string;
        getName(): string;
        getPhoto(): string;
        getDataAsync(keys: string[]): Promise<Record<string, unknown>>;
        setDataAsync(data: Record<string, unknown>): Promise<void>;
      };
      getLeaderboardAsync(name: string): Promise<{
        setScoreAsync(score: number, extraData?: string): Promise<void>;
      }>;
      getInterstitialAdAsync(placementId: string): Promise<{
        loadAsync(): Promise<void>;
        showAsync(): Promise<void>;
      }>;
      getRewardedVideoAsync(placementId: string): Promise<{
        loadAsync(): Promise<void>;
        showAsync(): Promise<void>;
      }>;
      onPause(callback: () => void): void;
    };
  }
}

export class FacebookInstantAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'facebook';

  readonly capabilities: PlatformCapabilities = {
    hasAds: true,
    hasRewardedAds: true,
    hasCloudSave: true,
    hasLeaderboards: true,
    hasSocialShare: true,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  private isInitialized = false;

  private get fb() {
    return typeof window !== 'undefined' ? window.FBInstant : undefined;
  }

  async initialize(): Promise<void> {
    if (!this.fb) return;
    try {
      await this.fb.initializeAsync();
      this.fb.setLoadingProgress(100);
      this.isInitialized = true;
    } catch (e) {
      this.logWarning(`Facebook initialize failed: ${e}`);
    }
  }

  notifyFirstFrameReady(): void {
    // Not required by FB, but kept consistent
  }

  notifyGameReady(): void {
    if (this.fb && this.isInitialized) {
      this.fb.startGameAsync().catch((err) => {
        this.logWarning(`FB startGameAsync failed: ${err}`);
      });
    }
  }

  isAudioEnabled(): boolean {
    return true;
  }

  onAudioEnabledChange(_callback: (enabled: boolean) => void): () => void {
    return () => {};
  }

  onPause(callback: () => void): () => void {
    if (this.fb?.onPause) {
      this.fb.onPause(callback);
    }
    return () => {};
  }

  onResume(_callback: () => void): () => void {
    return () => {};
  }

  async saveData(data: string): Promise<void> {
    if (this.fb?.player?.setDataAsync) {
      try {
        await this.fb.player.setDataAsync({ otg_save: data });
      } catch (err) {
        this.logWarning(`FB player setDataAsync error: ${err}`);
      }
    } else {
      localStorage.setItem('otg_fb_save', data);
    }
  }

  async loadData(): Promise<string | null> {
    if (this.fb?.player?.getDataAsync) {
      try {
        const res = await this.fb.player.getDataAsync(['otg_save']);
        if (typeof res?.otg_save === 'string') {
          return res.otg_save;
        }
      } catch (err) {
        this.logWarning(`FB player getDataAsync error: ${err}`);
      }
    }
    return localStorage.getItem('otg_fb_save');
  }

  async sendScore(value: number): Promise<void> {
    if (this.fb?.getLeaderboardAsync) {
      try {
        const leaderboard = await this.fb.getLeaderboardAsync('otg_high_score');
        await leaderboard.setScoreAsync(Math.floor(value));
      } catch (err) {
        this.logWarning(`FB leaderboard error: ${err}`);
      }
    }
  }

  async showInterstitial(placementId = 'default_interstitial'): Promise<AdResult> {
    if (this.fb?.getInterstitialAdAsync) {
      try {
        const ad = await this.fb.getInterstitialAdAsync(placementId);
        await ad.loadAsync();
        await ad.showAsync();
        return { shown: true };
      } catch (err) {
        return { shown: false, error: String(err) };
      }
    }
    return { shown: false };
  }

  async showRewarded(placementId = 'default_rewarded'): Promise<AdResult> {
    if (this.fb?.getRewardedVideoAsync) {
      try {
        const ad = await this.fb.getRewardedVideoAsync(placementId);
        await ad.loadAsync();
        await ad.showAsync();
        return { shown: true, rewardEarned: true };
      } catch (err) {
        return { shown: false, rewardEarned: false, error: String(err) };
      }
    }
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    if (this.fb?.getLocale) {
      return this.fb.getLocale().replace('_', '-');
    }
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[FacebookInstant] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[FacebookInstant] ${msg}`);
  }
}
