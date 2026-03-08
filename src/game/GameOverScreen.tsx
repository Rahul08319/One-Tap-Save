import { GameScore } from './types';

interface GameOverScreenProps {
  score: GameScore;
  onRestart: () => void;
}

export function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/95">
      <div className="flex flex-col items-center gap-5">
        <div className="text-6xl">⚽</div>

        <h2 className="font-display text-4xl text-accent tracking-wide" style={{ textShadow: 'var(--glow-accent)' }}>
          GAME OVER
        </h2>

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
