import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

export class StandaloneAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'standalone';

  readonly capabilities: PlatformCapabilities = {
    hasAds: true,
    hasRewardedAds: true,
    hasCloudSave: false,
    hasLeaderboards: false,
    hasSocialShare: true,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  private audioEnabled = true;
  private audioListeners: Array<(enabled: boolean) => void> = [];

  async initialize(): Promise<void> {}
  notifyFirstFrameReady(): void {}
  notifyGameReady(): void {}

  isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
    this.audioListeners.forEach((cb) => cb(enabled));
  }

  onAudioEnabledChange(callback: (enabled: boolean) => void): () => void {
    this.audioListeners.push(callback);
    return () => {
      this.audioListeners = this.audioListeners.filter((c) => c !== callback);
    };
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
    try {
      localStorage.setItem('otg_standalone_save', data);
    } catch {
      // quota
    }
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem('otg_standalone_save');
  }

  async sendScore(_value: number): Promise<void> {}

  async showInterstitial(): Promise<AdResult> {
    return { shown: true };
  }

  async showRewarded(_rewardId: string): Promise<AdResult> {
    // Simulates rewarded ad reward earned
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[Standalone] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[Standalone] ${msg}`);
  }
}
