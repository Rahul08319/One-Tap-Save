import { IPlatformAdapter, PlatformType } from './types';
import { YouTubePlayablesAdapter } from './adapters/YouTubePlayablesAdapter';
import { FacebookInstantAdapter } from './adapters/FacebookInstantAdapter';
import { PokiAdapter } from './adapters/PokiAdapter';
import { CrazyGamesAdapter } from './adapters/CrazyGamesAdapter';
import { YandexGamesAdapter } from './adapters/YandexGamesAdapter';
import { GameDistributionAdapter } from './adapters/GameDistributionAdapter';
import { DiscordActivitiesAdapter } from './adapters/DiscordActivitiesAdapter';
import { JioGamesAdapter } from './adapters/JioGamesAdapter';
import { Y8Adapter } from './adapters/Y8Adapter';
import { LaggedAdapter } from './adapters/LaggedAdapter';
import { MicrosoftStoreAdapter } from './adapters/MicrosoftStoreAdapter';
import { QuickGamesAdapter } from './adapters/QuickGamesAdapter';
import { MSNRedditAdapter } from './adapters/MSNRedditAdapter';
import { StandaloneAdapter } from './adapters/StandaloneAdapter';

export class PlatformManager {
  private static instance: PlatformManager;
  private currentAdapter: IPlatformAdapter;
  private initialized = false;

  private constructor() {
    this.currentAdapter = this.detectPlatform();
  }

  public static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
    }
    return PlatformManager.instance;
  }

  private detectPlatform(): IPlatformAdapter {
    if (typeof window === 'undefined') {
      return new StandaloneAdapter();
    }

    // 1. Explicit URL parameter override: ?platform=xyz
    try {
      const params = new URLSearchParams(window.location.search);
      const urlPlatform = params.get('platform')?.toLowerCase() as PlatformType;
      if (urlPlatform) {
        const adapter = this.createAdapter(urlPlatform);
        if (adapter) return adapter;
      }
    } catch {
      // ignore
    }

    // 2. Global SDK detection
    // YouTube Playables
    if (window.ytgame || (typeof document !== 'undefined' && document.querySelector('script[src*="youtube.com/game_api"]'))) {
      return new YouTubePlayablesAdapter();
    }

    // Facebook Instant
    if (window.FBInstant) {
      return new FacebookInstantAdapter();
    }

    // Poki
    if (window.PokiSDK) {
      return new PokiAdapter();
    }

    // CrazyGames
    if (window.CrazyGames) {
      return new CrazyGamesAdapter();
    }

    // Yandex Games
    if (window.YaGames) {
      return new YandexGamesAdapter();
    }

    // GameDistribution
    if (window.gdsdk || window.GD_OPTIONS) {
      return new GameDistributionAdapter();
    }

    // Discord Activities
    if (window.location.hostname.includes('discord') || window.location.search.includes('frame_id')) {
      return new DiscordActivitiesAdapter();
    }

    // JioGames
    if (window.JioGames) {
      return new JioGamesAdapter();
    }

    // Y8
    if (window.ID) {
      return new Y8Adapter();
    }

    // Lagged
    if (window.LaggedAPI) {
      return new LaggedAdapter();
    }

    // Huawei / Xiaomi Quick Games
    if (window.qg) {
      return new QuickGamesAdapter();
    }

    // Windows / Microsoft Store PWA
    if (window.Windows || window.matchMedia('(display-mode: standalone)').matches && navigator.userAgent.includes('Windows')) {
      return new MicrosoftStoreAdapter();
    }

    // Reddit Devvit
    if (window.location.search.includes('reddit') || window.parent !== window && document.referrer.includes('reddit')) {
      return new MSNRedditAdapter('reddit');
    }

    // MSN Games
    if (document.referrer.includes('msn.com') || window.location.search.includes('msn')) {
      return new MSNRedditAdapter('msn');
    }

    // Default to YouTubePlayablesAdapter if served on YouTube or Standalone fallback
    return new YouTubePlayablesAdapter();
  }

  public createAdapter(type: PlatformType): IPlatformAdapter | null {
    switch (type) {
      case 'youtube': return new YouTubePlayablesAdapter();
      case 'facebook': return new FacebookInstantAdapter();
      case 'poki': return new PokiAdapter();
      case 'crazygames': return new CrazyGamesAdapter();
      case 'yandex': return new YandexGamesAdapter();
      case 'gamedistribution': return new GameDistributionAdapter();
      case 'discord': return new DiscordActivitiesAdapter();
      case 'jiogames': return new JioGamesAdapter();
      case 'y8': return new Y8Adapter();
      case 'lagged': return new LaggedAdapter();
      case 'msstore': return new MicrosoftStoreAdapter();
      case 'quickgames': return new QuickGamesAdapter();
      case 'msn': return new MSNRedditAdapter('msn');
      case 'reddit': return new MSNRedditAdapter('reddit');
      case 'standalone': return new StandaloneAdapter();
      default: return null;
    }
  }

  public setPlatform(type: PlatformType): void {
    const adapter = this.createAdapter(type);
    if (adapter) {
      this.currentAdapter = adapter;
      void this.currentAdapter.initialize();
    }
  }

  public get adapter(): IPlatformAdapter {
    return this.currentAdapter;
  }

  public get platform(): PlatformType {
    return this.currentAdapter.platform;
  }

  public async initialize(): Promise<void> {
    if (!this.initialized) {
      this.initialized = true;
      await this.currentAdapter.initialize();
    }
  }

  public notifyFirstFrameReady(): void {
    this.currentAdapter.notifyFirstFrameReady();
  }

  public notifyGameReady(): void {
    this.currentAdapter.notifyGameReady();
  }

  public notifyGameplayStart(): void {
    this.currentAdapter.notifyGameplayStart?.();
  }

  public notifyGameplayStop(): void {
    this.currentAdapter.notifyGameplayStop?.();
  }

  public isAudioEnabled(): boolean {
    return this.currentAdapter.isAudioEnabled();
  }

  public onAudioEnabledChange(callback: (enabled: boolean) => void): () => void {
    return this.currentAdapter.onAudioEnabledChange(callback);
  }

  public onPause(callback: () => void): () => void {
    return this.currentAdapter.onPause(callback);
  }

  public onResume(callback: () => void): () => void {
    return this.currentAdapter.onResume(callback);
  }

  public async saveData(data: string): Promise<void> {
    return this.currentAdapter.saveData(data);
  }

  public async loadData(): Promise<string | null> {
    return this.currentAdapter.loadData();
  }

  public async sendScore(value: number): Promise<void> {
    return this.currentAdapter.sendScore(value);
  }

  public async showInterstitial(placement?: string) {
    return this.currentAdapter.showInterstitial(placement);
  }

  public async showRewarded(rewardId: string) {
    return this.currentAdapter.showRewarded(rewardId);
  }

  public async getLanguage(): Promise<string> {
    return this.currentAdapter.getLanguage();
  }

  public async openContent(id: string, type?: 'VIDEO' | 'PLAYABLE'): Promise<void> {
    return this.currentAdapter.openContent?.(id, type);
  }

  public logWarning(msg?: string): void {
    this.currentAdapter.logWarning(msg);
  }

  public logError(msg?: string): void {
    this.currentAdapter.logError(msg);
  }
}

export const platformManager = PlatformManager.getInstance();
