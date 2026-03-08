import { GameScore, Difficulty } from './types';
import { getHighScores } from './highScores';

interface GameOverScreenProps {
  score: GameScore;
  onRestart: () => void;
  isNewHighScore: boolean;
  difficulty: Difficulty;
}

export function GameOverScreen({ score, onRestart, isNewHighScore, difficulty }: GameOverScreenProps) {
  const highScores = getHighScores();
  const best = highScores[difficulty];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/95">
      <div className="flex flex-col items-center gap-5">
        <div className="text-6xl">⚽</div>

        <h2 className="font-display text-4xl text-accent tracking-wide" style={{ textShadow: 'var(--glow-accent)' }}>
          GAME OVER
        </h2>

        {isNewHighScore && (
          <div className="font-display text-xl text-secondary text-glow-secondary animate-pulse tracking-widest">
            🏆 NEW HIGH SCORE! 🏆
          </div>
        )}

        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <span className="font-display text-5xl text-primary text-glow-primary">{score.saves}</span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Saves</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-5xl text-secondary text-glow-secondary">{score.bestStreak}</span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Best Streak</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-5xl text-foreground">{score.round - 1}</span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Rounds</span>
          </div>
        </div>

        {/* All-time best */}
        <div className="border border-border rounded-lg px-4 py-2 mt-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground block text-center mb-1">
            {difficulty.toUpperCase()} RECORD
          </span>
          <div className="flex gap-4 text-center">
            <div>
              <span className="font-display text-lg text-primary">{best.saves}</span>
              <span className="block text-[8px] text-muted-foreground">SAVES</span>
            </div>
            <div>
              <span className="font-display text-lg text-secondary">{best.bestStreak}</span>
              <span className="block text-[8px] text-muted-foreground">STREAK</span>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="mt-4 px-10 py-4 bg-primary text-primary-foreground font-display text-2xl tracking-wider rounded-lg box-glow-primary active:scale-95 transition-transform"
        >
          RETRY
        </button>
      </div>
    </div>
  );
}
