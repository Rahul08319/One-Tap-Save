import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    PokiSDK?: {
      init(): Promise<void>;
      gameLoadingStart(): void;
      gameLoadingFinished(): void;
      gameplayStart(): void;
      gameplayStop(): void;
      commercialBreak(): Promise<void>;
      rewardedBreak(): Promise<boolean>;
    };
  }
}

export class PokiAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'poki';

  readonly capabilities: PlatformCapabilities = {
    hasAds: true,
    hasRewardedAds: true,
    hasCloudSave: false,
    hasLeaderboards: false,
    hasSocialShare: false,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  private get poki() {
    return typeof window !== 'undefined' ? window.PokiSDK : undefined;
  }

  async initialize(): Promise<void> {
    if (this.poki) {
      try {
        this.poki.gameLoadingStart();
        await this.poki.init();
      } catch (e) {
        this.logWarning(`Poki init warning: ${e}`);
      }
    }
  }

  notifyFirstFrameReady(): void {
    // Handled by loading finished
  }

  notifyGameReady(): void {
    this.poki?.gameLoadingFinished();
  }

  notifyGameplayStart(): void {
    this.poki?.gameplayStart();
  }

  notifyGameplayStop(): void {
    this.poki?.gameplayStop();
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
    localStorage.setItem('otg_poki_save', data);
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem('otg_poki_save');
  }

  async sendScore(_value: number): Promise<void> {
    // Poki uses custom leaderboards if enabled
  }

  async showInterstitial(): Promise<AdResult> {
    if (this.poki?.commercialBreak) {
      try {
        this.notifyGameplayStop();
        await this.poki.commercialBreak();
        this.notifyGameplayStart();
        return { shown: true };
      } catch (err) {
        this.notifyGameplayStart();
        return { shown: false, error: String(err) };
      }
    }
    return { shown: false };
  }

  async showRewarded(_rewardId: string): Promise<AdResult> {
    if (this.poki?.rewardedBreak) {
      try {
        this.notifyGameplayStop();
        const success = await this.poki.rewardedBreak();
        this.notifyGameplayStart();
        return { shown: true, rewardEarned: Boolean(success) };
      } catch (err) {
        this.notifyGameplayStart();
        return { shown: false, rewardEarned: false, error: String(err) };
      }
    }
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[PokiSDK] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[PokiSDK] ${msg}`);
  }
}
