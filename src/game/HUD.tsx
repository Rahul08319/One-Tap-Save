import { GameScore } from './types';
import { ActivePowerUp, POWER_UP_CONFIG } from './powerUps';
import { isAudioMuted, setGameAudioEnabled } from './sounds';
import { useState } from 'react';

interface HUDProps {
  score: GameScore;
  difficulty: number;
  comboMultiplier: number;
  showCombo: boolean;
  totalPoints: number;
  activePowerUp: ActivePowerUp | null;
  showPowerUp: boolean;
  isDaily?: boolean;
  dailyRounds?: number;
  onPauseClick?: () => void;
  platformName?: string;
}

export function HUD({
  score,
  comboMultiplier,
  showCombo,
  totalPoints,
  activePowerUp,
  showPowerUp,
  isDaily,
  dailyRounds,
  onPauseClick,
  platformName,
}: HUDProps) {
  const [muted, setMuted] = useState(isAudioMuted());

  const toggleMute = () => {
    const next = !muted;
    setGameAudioEnabled(!next);
    setMuted(next);
  };

  return (
    <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-3 px-3 z-20 pointer-events-none">
      {/* Apple Dynamic Island Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center gap-2">
        {/* Saves Pill */}
        <div className="apple-glass rounded-full px-3.5 py-1.5 flex items-center gap-2 pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div className="flex flex-col">
            <span className="font-display text-xl leading-none text-foreground">
              {score.saves} <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-wider">Saves</span>
            </span>
          </div>
          {totalPoints > score.saves && (
            <span className="text-[10px] font-semibold text-secondary px-1.5 py-0.5 rounded-full bg-secondary/10">
              +{totalPoints - score.saves}
            </span>
          )}
        </div>

        {/* Center Round & Streak Capsule */}
        <div className="apple-glass rounded-full px-4 py-1.5 flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground tracking-tight">
            {isDaily ? `Day ${score.round}/${dailyRounds}` : `Round ${score.round}`}
          </span>
          {score.streak >= 2 && (
            <span className="text-[11px] font-medium text-secondary flex items-center gap-0.5">
              🔥 {score.streak}
            </span>
          )}
          {platformName && (
            <span className="text-[8px] uppercase tracking-wider font-semibold text-muted-foreground/80 px-1 py-0.5 rounded bg-white/5">
              {platformName}
            </span>
          )}
        </div>

        {/* Controls: Sound Mute & Pause */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={toggleMute}
            className="apple-glass w-8 h-8 rounded-full flex items-center justify-center text-xs text-foreground active:scale-90 transition-transform"
            aria-label={muted ? 'Unmute game' : 'Mute game'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {onPauseClick && (
            <button
              type="button"
              onClick={onPauseClick}
              className="apple-glass w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-foreground active:scale-90 transition-transform"
              aria-label="Pause game"
            >
              ⏸
            </button>
          )}
        </div>
      </div>

      {/* Combo Banner */}
      {showCombo && comboMultiplier >= 2 && (
        <div className="mt-2 apple-glass-card rounded-full px-4 py-1 flex items-center gap-1.5 border-secondary/40 shadow-lg animate-bounce">
          <span className="text-sm">⚡</span>
          <span className="text-xs font-bold text-secondary tracking-wide">
            {comboMultiplier}X COMBO BONUS!
          </span>
        </div>
      )}

      {/* Active Power-up Pill */}
      {activePowerUp && (
        <div
          className={`mt-2 apple-glass rounded-full px-3.5 py-1 flex items-center gap-2 border-secondary/30 ${
            showPowerUp ? 'scale-105 transition-transform' : ''
          }`}
        >
          <span className="text-sm">{POWER_UP_CONFIG[activePowerUp.type].emoji}</span>
          <span className="text-xs font-semibold text-foreground">
            {POWER_UP_CONFIG[activePowerUp.type].label}
          </span>
          <span className="text-[10px] text-secondary font-medium">
            {activePowerUp.roundsLeft}r left
          </span>
        </div>
      )}

      {/* Hearts / Conceded Goals Indicator */}
      <div className="mt-2 flex items-center gap-2">
        {[0, 1, 2].map((i) => {
          const conceded = i < score.goals;
          return (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                conceded
                  ? 'bg-accent shadow-[0_0_8px_rgba(255,59,48,0.8)] scale-110'
                  : 'bg-white/20 border border-white/20'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
