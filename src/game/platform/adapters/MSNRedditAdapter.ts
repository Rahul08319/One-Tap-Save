import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

export class MSNRedditAdapter implements IPlatformAdapter {
  readonly platform: PlatformType;

  readonly capabilities: PlatformCapabilities = {
    hasAds: false,
    hasRewardedAds: false,
    hasCloudSave: true,
    hasLeaderboards: true,
    hasSocialShare: true,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  constructor(type: 'msn' | 'reddit' = 'reddit') {
    this.platform = type;
  }

  async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type: 'REDDIT_DEVVIT_GAME_READY', game: 'OneTapGoalkeeper' }, '*');
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
    localStorage.setItem(`otg_${this.platform}_save`, data);
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type: 'SAVE_DATA', data }, '*');
    }
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem(`otg_${this.platform}_save`);
  }

  async sendScore(value: number): Promise<void> {
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type: 'SUBMIT_SCORE', score: Math.floor(value) }, '*');
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
    if (msg) console.warn(`[${this.platform.toUpperCase()}] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[${this.platform.toUpperCase()}] ${msg}`);
  }
}
