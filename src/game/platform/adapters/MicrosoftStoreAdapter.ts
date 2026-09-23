import { AdResult, IPlatformAdapter, PlatformCapabilities, PlatformType } from '../types';

declare global {
  interface Window {
    Windows?: {
      UI: {
        ViewManagement: {
          ApplicationView: {
            getForCurrentView(): {
              titleBar: {
                backgroundColor: unknown;
                foregroundColor: unknown;
              };
            };
          };
        };
      };
    };
  }
}

export class MicrosoftStoreAdapter implements IPlatformAdapter {
  readonly platform: PlatformType = 'msstore';

  readonly capabilities: PlatformCapabilities = {
    hasAds: false,
    hasRewardedAds: false,
    hasCloudSave: true,
    hasLeaderboards: false,
    hasSocialShare: false,
    supportsInGameAudioMute: true,
    requiresStrictFirstFrameOrder: false,
  };

  async initialize(): Promise<void> {
    // Style Windows titlebar if running in WinRT PWA host
    if (typeof window !== 'undefined' && window.Windows) {
      try {
        const titleBar = window.Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;
        if (titleBar) {
          // Customize Windows titlebar colors
        }
      } catch {
        // Not inside WinRT
      }
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
    localStorage.setItem('otg_msstore_save', data);
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem('otg_msstore_save');
  }

  async sendScore(_value: number): Promise<void> {}

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
    if (msg) console.warn(`[MicrosoftStore] ${msg}`);
  }

  logError(msg?: string): void {
    if (msg) console.error(`[MicrosoftStore] ${msg}`);
  }
}
