import { GameScore } from './types';

interface HUDProps {
  score: GameScore;
  difficulty: number;
  comboMultiplier: number;
  showCombo: boolean;
  totalPoints: number;
}

export function HUD({ score, difficulty, comboMultiplier, showCombo, totalPoints }: HUDProps) {
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
          RD {score.round}
        </span>
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
    </div>
  );
}
