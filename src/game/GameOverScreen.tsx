import { GameScore, Difficulty } from './types';
import { getHighScores } from './highScores';
import { getDailyRecord } from './dailyChallenge';
import { useEffect, useState } from 'react';
import { getLeague, getPlayerProfile, recordMatch } from './playerProgress';
import { requestInterstitialAd, requestRewardedAd } from './youtubePlayables';
import { hapticStreak, hapticTap } from './haptics';

interface GameOverScreenProps {
  score: GameScore;
  onRestart: () => void;
  isNewHighScore: boolean;
  difficulty: Difficulty;
  totalPoints: number;
  isDaily?: boolean;
}

export function GameOverScreen({
  score,
  onRestart,
  isNewHighScore,
  difficulty,
  totalPoints: initialTotalPoints,
  isDaily,
}: GameOverScreenProps) {
  const highScores = getHighScores();
  const best = highScores[difficulty];
  const dailyRecord = getDailyRecord();
  const [profile, setProfile] = useState(getPlayerProfile());
  const [showHighlights, setShowHighlights] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints);
  const [hasClaimedDouble, setHasClaimedDouble] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  useEffect(() => {
    setProfile(recordMatch(score.saves, initialTotalPoints));
  }, []);

  const challengeCode = `OTG-${profile.season.replace('-', '')}-${score.saves}-${score.bestStreak}`;

  const copyChallengeCode = () => {
    try {
      navigator.clipboard.writeText(
        `I saved ${score.saves} penalties with a ${score.bestStreak} streak in One Tap Goalkeeper! Can you beat my score? Code: ${challengeCode}`
      );
      setCopiedCode(true);
      hapticTap();
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDoublePoints = async () => {
    if (hasClaimedDouble || isLoadingAd) return;
    setIsLoadingAd(true);
    const earned = await requestRewardedAd('double-match-points');
    setIsLoadingAd(false);
    if (earned) {
      const doubled = totalPoints * 2;
      setTotalPoints(doubled);
      setHasClaimedDouble(true);
      setProfile(recordMatch(0, totalPoints));
      hapticStreak();
    }
  };

  const handleRestart = async () => {
    hapticTap();
    // Interstitial ad trigger between matches
    void requestInterstitialAd('game_over_retry');
    onRestart();
  };

  return (\n    <div className=\"absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/90 backdrop-blur-xl p-4 overflow-y-auto\">
      <div className=\"w-full max-w-sm flex flex-col items-center gap-4 my-auto\">
        {/* Header Icon & Title */}
        <div className=\"flex flex-col items-center gap-1 text-center\">
          <div className=\"w-14 h-14 rounded-2xl apple-glass flex items-center justify-center text-3xl shadow-lg mb-1\">
            {isDaily ? '📅' : isNewHighScore ? '🏆' : '⚽'}
          </div>

          <h2 className=\"font-display text-4xl text-foreground font-semibold tracking-tight\">
            {isDaily ? 'Daily Match Complete' : 'Full Time'}
          </h2>

          <p className=\"text-xs text-muted-foreground\">
            {isDaily
              ? 'Great performance in the daily challenge!'
              : score.goals >= 3
              ? 'Three shots found the net. Match ended.'
              : 'Match finished!'}
          </p>
        </div>

        {/* High Score Banner */}
        {isNewHighScore && !isDaily && (
          <div className=\"apple-glass rounded-full px-4 py-1.5 border-[#ffd60a]/40 bg-[#ffd60a]/10 flex items-center gap-2 animate-bounce\">
            <span>✨</span>
            <span className=\"text-xs font-semibold text-[#ffd60a] tracking-wide\">
              NEW PERSONAL BEST RECORD!
            </span>
          </div>
        )}

        {/* Core Match Stats Grid - Apple Museum Style */}
        <div className=\"w-full apple-glass rounded-2xl p-4 flex justify-around items-center\">
          <div className=\"flex flex-col items-center\">
            <span className=\"font-display text-4xl font-bold text-primary leading-none\">
              {score.saves}
            </span>
            <span className=\"text-[11px] font-medium text-muted-foreground mt-1\">Saves</span>
          </div>

          <div className=\"h-8 w-px bg-white/10\" />

          <div className=\"flex flex-col items-center\">
            <span className=\"font-display text-4xl font-bold text-secondary leading-none\">
              {score.bestStreak}
            </span>
            <span className=\"text-[11px] font-medium text-muted-foreground mt-1\">Streak</span>
          </div>

          <div className=\"h-8 w-px bg-white/10\" />

          <div className=\"flex flex-col items-center\">
            <span className=\"font-display text-4xl font-bold text-foreground leading-none\">
              {totalPoints}
            </span>
            <span className=\"text-[11px] font-medium text-muted-foreground mt-1\">Points</span>
          </div>
        </div>

        {/* Rewarded Ad Offer: Double Points */}
        {!hasClaimedDouble && totalPoints > 0 && (
          <button
            type=\"button\"
            onClick={handleDoublePoints}
            disabled={isLoadingAd}
            className=\"w-full apple-glass-card rounded-2xl p-3 flex items-center justify-between border-secondary/40 hover:border-secondary transition-all active:scale-98\"
          >
            <div className=\"flex items-center gap-2.5\">
              <span className=\"text-xl\">🎁</span>
              <div className=\"text-left\">
                <div className=\"text-xs font-semibold text-secondary\">
                  Watch Ad to 2x Points (+{totalPoints} pts)
                </div>
                <div className=\"text-[10px] text-muted-foreground\">
                  Boost your league XP and unlock gloves faster
                </div>
              </div>
            </div>
            <span className=\"text-xs font-bold text-secondary px-2.5 py-1 rounded-full bg-secondary/15\">
              {isLoadingAd ? 'Loading...' : 'Claim 2X'}
            </span>
          </button>
        )}

        {/* Player Profile & League Progress */}
        <div className=\"w-full apple-glass-card rounded-2xl p-3 flex items-center justify-between text-xs\">
          <div className=\"flex items-center gap-2\">
            <span className=\"text-lg\">🧤</span>
            <div>
              <div className=\"font-semibold text-foreground\">{getLeague(profile)} League</div>
              <div className=\"text-[10px] text-muted-foreground\">{profile.xp} Total Career XP</div>
            </div>
          </div>
          <button
            type=\"button\"
            onClick={copyChallengeCode}
            className=\"apple-pill-secondary text-[11px] py-1 px-3\"
          >
            {copiedCode ? '✓ Copied' : 'Share Challenge'}
          </button>
        </div>

        {/* Replay Details Toggle */}
        <button
          type=\"button\"
          onClick={() => setShowHighlights(!showHighlights)}
          className=\"text-xs text-primary hover:underline font-medium\"
        >
          {showHighlights ? 'Hide Match Summary' : 'View Detailed Breakdown'}
        </button>

        {showHighlights && (
          <div className=\"w-full apple-glass-card rounded-2xl p-3.5 flex flex-col gap-2 text-xs\">
            <div className=\"flex justify-between text-muted-foreground\">
              <span>Difficulty Mode:</span>
              <span className=\"font-medium text-foreground uppercase\">{difficulty}</span>
            </div>
            <div className=\"flex justify-between text-muted-foreground\">
              <span>Clean Sheet Ratio:</span>
              <span className=\"font-medium text-foreground\">
                {Math.round((score.saves / Math.max(1, score.saves + score.goals)) * 100)}%
              </span>
            </div>
            <div className=\"flex justify-between text-muted-foreground\">
              <span>Combos & Multipliers:</span>
              <span className=\"font-medium text-foreground\">
                +{Math.max(0, totalPoints - score.saves)} pts
              </span>
            </div>
            <div className=\"flex justify-between text-muted-foreground\">
              <span>All-Time Best ({difficulty}):</span>
              <span className=\"font-medium text-foreground\">{best.saves} Saves</span>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={handleRestart}
          className=\"apple-pill-primary w-full py-3.5 text-base font-semibold tracking-wide mt-1 flex items-center justify-center gap-2\"
        >
          <span>{isDaily ? 'Return to Menu' : 'Play Again'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
