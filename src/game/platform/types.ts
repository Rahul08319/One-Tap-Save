/**
 * Unified multi-platform gaming SDK types.
 * Supports YouTube Playables, Facebook Instant Games, Poki, CrazyGames, Yandex,
 * GameDistribution, Discord Activities, JioGames, Y8, Lagged, Microsoft Store (PWA),
 * Huawei/Xiaomi Quick Games, MSN & Reddit Games, and Standalone.
 */

export type PlatformType =
  | 'youtube'
  | 'facebook'
  | 'poki'
  | 'crazygames'
  | 'yandex'
  | 'gamedistribution'
  | 'discord'
  | 'jiogames'
  | 'y8'
  | 'lagged'
  | 'msstore'
  | 'quickgames'
  | 'msn'
  | 'reddit'
  | 'standalone';

export interface PlatformCapabilities {
  hasAds: boolean;
  hasRewardedAds: boolean;
  hasCloudSave: boolean;
  hasLeaderboards: boolean;
  hasSocialShare: boolean;
  supportsInGameAudioMute: boolean;
  requiresStrictFirstFrameOrder: boolean;
}

export interface AdResult {
  shown: boolean;
  rewardEarned?: boolean;
  error?: string;
}

export interface IPlatformAdapter {
  readonly platform: PlatformType;
  readonly capabilities: PlatformCapabilities;

  /** Initialize platform SDK */
  initialize(): Promise<void>;

  /** Signal first visual frame has rendered (strictly required for YouTube Playables) */
  notifyFirstFrameReady(): void;

  /** Signal game is interactive (must not be called during loading screen) */
  notifyGameReady(): void;

  /** Gameplay state lifecycle notifications (used by Poki, CrazyGames, Discord, etc.) */
  notifyGameplayStart?(): void;
  notifyGameplayStop?(): void;

  /** Audio sync with platform settings */
  isAudioEnabled(): boolean;
  onAudioEnabledChange(callback: (enabled: boolean) => void): () => void;

  /** System pause & resume events */
  onPause(callback: () => void): () => void;
  onResume(callback: () => void): () => void;

  /** Cloud data persistence (max 3MB UTF-16 on YouTube) */
  saveData(data: string): Promise<void>;
  loadData(): Promise<string | null>;

  /** High score & dimension reporting */
  sendScore(value: number): Promise<void>;

  /** Ads */
  showInterstitial(placement?: string): Promise<AdResult>;
  showRewarded(rewardId: string): Promise<AdResult>;

  /** Localization */
  getLanguage(): Promise<string>;

  /** Platform specific actions (e.g. YouTube open video / share) */
  openContent?(id: string, type?: 'VIDEO' | 'PLAYABLE'): Promise<void>;

  /** Telemetry / Health logs */
  logWarning(message?: string): void;
  logError(message?: string): void;
}
