import { GameScore, Difficulty } from './types';
import { getHighScores } from './highScores';
import { getDailyRecord } from './dailyChallenge';
import { useEffect, useState } from 'react';
import { getLeague, getPlayerProfile, recordMatch } from './playerProgress';

interface GameOverScreenProps {
  score: GameScore;
  onRestart: () => void;
  isNewHighScore: boolean;
  difficulty: Difficulty;
  totalPoints: number;
  isDaily?: boolean;
}

export function GameOverScreen({ score, onRestart, isNewHighScore, difficulty, totalPoints, isDaily }: GameOverScreenProps) {
  const highScores = getHighScores();
  const best = highScores[difficulty];
  const dailyRecord = getDailyRecord();
  const [profile, setProfile] = useState(getPlayerProfile());
  const [showHighlights, setShowHighlights] = useState(false);

  useEffect(() => {
    setProfile(recordMatch(score.saves, totalPoints));
  }, []);

  const challengeCode = `GK-${profile.season.replace('-', '')}-${score.saves}-${score.bestStreak}`;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/95">
      <div className="flex flex-col items-center gap-5">
        <div className="text-6xl">{isDaily ? '📅' : '⚽'}</div>

        <h2 className="font-display text-4xl text-accent tracking-wide" style={{ textShadow: 'var(--glow-accent)' }}>
          {isDaily ? 'DAILY COMPLETE' : 'GAME OVER'}
        </h2>

        {isNewHighScore && !isDaily && (
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

        {totalPoints > score.saves && (
          <div className="font-display text-lg text-secondary text-glow-secondary">
            ⭐ {totalPoints} TOTAL POINTS (incl. combo bonus)
          </div>
        )}

        <div className="rounded-lg border border-border px-4 py-2 text-center">
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{getLeague(profile)} league · {profile.xp} XP</div>
          <div className="mt-1 text-[10px] text-secondary">Challenge code: {challengeCode}</div>
        </div>

        <button type="button" onClick={() => setShowHighlights(!showHighlights)} className="text-[10px] uppercase tracking-widest text-primary underline">
          {showHighlights ? 'Hide replay highlights' : 'View replay highlights'}
        </button>
        {showHighlights && (
          <div className="rounded-lg border border-primary/30 bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">
            <div>Best run: {score.saves} saves · {score.bestStreak} save streak</div>
            <div>Combo points earned: {Math.max(0, totalPoints - score.saves)}</div>
          </div>
        )}

        {/* Daily best */}
        {isDaily && dailyRecord && (
          <div className="border border-secondary/30 rounded-lg px-4 py-2 mt-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block text-center mb-1">
              TODAY'S BEST
            </span>
            <div className="flex gap-4 text-center">
              <div>
                <span className="font-display text-lg text-primary">{dailyRecord.saves}</span>
                <span className="block text-[8px] text-muted-foreground">SAVES</span>
              </div>
              <div>
                <span className="font-display text-lg text-secondary">{dailyRecord.totalPoints}</span>
                <span className="block text-[8px] text-muted-foreground">POINTS</span>
              </div>
            </div>
          </div>
        )}

        {/* All-time best (classic only) */}
        {!isDaily && (
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
        )}

        <button
          onClick={onRestart}
          className="mt-4 px-10 py-4 bg-primary text-primary-foreground font-display text-2xl tracking-wider rounded-lg box-glow-primary active:scale-95 transition-transform"
        >
          {isDaily ? 'MENU' : 'RETRY'}
        </button>
      </div>
    </div>
  );
}
