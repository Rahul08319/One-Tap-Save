import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

export class DiscordActivitiesAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'discord';

  readonly capabilities: PlatformCapabilities = {
    hasAds: false,
    hasRewardedAds: false,
    hasCloudSave: true,
    hasLeaderboards: true,
    hasSocialShare: true,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  private isReady = false;

  async initialize(): Promise<void> {
    // Notify Discord RPC wrapper via postMessage or custom bridge
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type: 'DISCORD_ACTIVITY_INIT' }, '*');
      this.isReady = true;
    }
  }

  notifyFirstFrameReady(): void {}

  notifyGameReady(): void {
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type: 'DISCORD_ACTIVITY_READY' }, '*');
    }
  }

  isAudioEnabled(): boolean {
    return true;
  }

  onAudioEnabledChange(_callback: (enabled: boolean) => void): () => void {
    return () => {};
  }

  onPause(callback: () => void): () => void {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'DISCORD_ACTIVITY_PAUSE') callback();
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }

  onResume(callback: () => void): () => void {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'DISCORD_ACTIVITY_RESUME') callback();
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }

  async saveData(data: string): Promise<void> {
    localStorage.setItem('otg_discord_save', data);
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem('otg_discord_save');
  }

  async sendScore(value: number): Promise<void> {
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type: 'DISCORD_SCORE_UPDATE', score: Math.floor(value) }, '*');
    }
  }

  async showInterstitial(): Promise<AdResult> {
    return { shown: false };
  }

  async showRewarded(_rewardId: string): Promise<AdResult> {
    return { shown: true, rewardEarned: true };
  }

  async getLanguage(): Promise<string> {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }

  logWarning(msg?: string): void {
    if (msg) console.warn(`[DiscordActivity] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[DiscordActivity] ${msg}`);
  }
}
