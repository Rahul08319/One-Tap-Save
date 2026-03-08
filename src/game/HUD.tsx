import { GameScore } from './types';
import { ActivePowerUp, POWER_UP_CONFIG } from './powerUps';

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
}

export function HUD({ score, difficulty, comboMultiplier, showCombo, totalPoints, activePowerUp, showPowerUp, isDaily, dailyRounds }: HUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-4 pt-3 pointer-events-none z-10">
      <div className="flex flex-col items-center">
        <span className="font-display text-3xl text-primary text-glow-primary leading-none">
          {score.saves}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Saves</span>
        {totalPoints > score.saves && (
          <span className="text-[9px] text-secondary font-display">+{totalPoints - score.saves} bonus</span>
        )}
      </div>
      
      <div className="flex flex-col items-center">
        <span className="font-display text-lg text-muted-foreground leading-none">
          {isDaily ? `${score.round}/${dailyRounds}` : `RD ${score.round}`}
        </span>
        {isDaily && (
          <span className="text-[9px] uppercase tracking-widest text-secondary">📅 DAILY</span>
        )}
        {score.streak >= 2 && (
          <span className="text-[10px] uppercase tracking-widest text-secondary text-glow-secondary">
            🔥 {score.streak} streak
          </span>
        )}
        {showCombo && comboMultiplier >= 2 && (
          <span className="font-display text-sm text-secondary text-glow-secondary animate-pulse tracking-wider mt-0.5">
            x{comboMultiplier} COMBO!
          </span>
        )}
      </div>

      <div className="flex flex-col items-center">
        <span className="font-display text-3xl text-accent leading-none" style={{ textShadow: 'var(--glow-accent)' }}>
          {score.goals}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Goals</span>
      </div>

      {/* Power-up indicator */}
      {activePowerUp && (
        <div className={`absolute top-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-secondary/40 ${showPowerUp ? 'animate-bounce' : ''}`}>
          <span className="text-base">{POWER_UP_CONFIG[activePowerUp.type].emoji}</span>
          <span className="font-display text-xs text-secondary tracking-wider">
            {POWER_UP_CONFIG[activePowerUp.type].label}
          </span>
          <span className="text-[9px] text-muted-foreground">
            {activePowerUp.roundsLeft}r
          </span>
        </div>
      )}
    </div>
  );
}
