import { useState, useCallback, useRef, useEffect } from 'react';
import { Direction, GameState, GameScore, Difficulty } from './types';
import { playKickSound, playSaveSound, playGoalSound, playStreakSound, playComboSound, setGamePaused, startCrowdAmbience, stopCrowdAmbience, crowdCheer, crowdGroan } from './sounds';
import { updateHighScore } from './highScores';
import { hapticSave, hapticGoal, hapticStreak, hapticPowerUp } from './haptics';
import { getDailyShotSequence, getDailyRoundCount, saveDailyRecord } from './dailyChallenge';
import { ActivePowerUp, shouldAwardPowerUp, getRandomPowerUp, POWER_UP_CONFIG } from './powerUps';
import { persistGameData, sendScoreToYouTube, notifyGameplayStart, notifyGameplayStop } from './youtubePlayables';

const MAX_GOALS = 3;

const DIFFICULTY_SPEEDS: Record<Difficulty, { base: number; increment: number }> = {
  easy: { base: 0.012, increment: 0.002 },
  medium: { base: 0.018, increment: 0.003 },
  hard: { base: 0.025, increment: 0.004 },
};

export type GameMode = 'classic' | 'daily';

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState<GameScore>({
    saves: 0, goals: 0, round: 1, streak: 0, bestStreak: 0,
  });
  const [ballDirection, setBallDirection] = useState<Direction>('center');
  const [diveDirection, setDiveDirection] = useState<Direction | null>(null);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [ballProgress, setBallProgress] = useState(0);
  const [diveProgress, setDiveProgress] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [screenShake, setScreenShake] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboDirection, setComboDirection] = useState<Direction | null>(null);
  const [showCombo, setShowCombo] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [activePowerUp, setActivePowerUp] = useState<ActivePowerUp | null>(null);
  const [showPowerUp, setShowPowerUp] = useState(false);
  const [wideDiveActive, setWideDiveActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const animFrameRef = useRef<number>(0);
  const hasInputRef = useRef(false);
  const ballProgressAtDiveRef = useRef(0);
  const dailySequenceRef = useRef<Direction[]>([]);
  const dailyRoundRef = useRef(0);

  const getRandomDirection = (): Direction => {
    const dirs: Direction[] = ['left', 'center', 'right'];
    return dirs[Math.floor(Math.random() * dirs.length)];
  };

  const startGame = useCallback((diff?: Difficulty, mode: GameMode = 'classic') => {
    const d = diff || selectedDifficulty;
    setSelectedDifficulty(d);
    setScore({ saves: 0, goals: 0, round: 1, streak: 0, bestStreak: 0 });
    setDifficulty(1);
    setIsNewHighScore(false);
    setComboMultiplier(1);
    setComboDirection(null);
    setTotalPoints(0);
    setGameMode(mode);
    setActivePowerUp(null);
    setShowPowerUp(false);
    setWideDiveActive(false);

    if (mode === 'daily') {
      dailySequenceRef.current = getDailyShotSequence();
      dailyRoundRef.current = 0;
      setSelectedDifficulty('medium'); // Daily is always medium
    }

    setGameState('ready');
    notifyGameplayStart();
    startCrowdAmbience();
  }, [selectedDifficulty]);

  const startRound = useCallback(() => {
    let dir: Direction;
    if (gameMode === 'daily') {
      dir = dailySequenceRef.current[dailyRoundRef.current] || getRandomDirection();
      dailyRoundRef.current++;
    } else {
      dir = getRandomDirection();
    }

    setBallDirection(dir);
    setDiveDirection(null);
    setSaved(null);
    setBallProgress(0);
    setDiveProgress(0);
    hasInputRef.current = false;
    ballProgressAtDiveRef.current = 0;
    setShowCombo(false);
    setShowPowerUp(false);

    // Check wide dive
    setWideDiveActive(activePowerUp?.type === 'widedive');

    setGameState('shooting');
    playKickSound();
  }, [gameMode, activePowerUp]);

  const handleDive = useCallback((dir: Direction) => {
    if (isPaused || hasInputRef.current || gameState !== 'shooting') return;
    hasInputRef.current = true;
    ballProgressAtDiveRef.current = ballProgress;
    setDiveDirection(dir);
  }, [gameState, ballProgress, isPaused]);

  const pauseGame = useCallback(() => {
    setIsPaused(true);
    setGamePaused(true);
    void persistGameData();
  }, []);

  const resumeGame = useCallback(() => {
    setGamePaused(false);
    setIsPaused(false);
  }, []);

  const finalizeGameOver = useCallback((finalScore: GameScore) => {
    if (gameMode === 'daily') {
      saveDailyRecord(finalScore.saves, totalPoints);
    }
    const isNew = gameMode === 'classic'
      ? updateHighScore(selectedDifficulty, finalScore)
      : false;
    setIsNewHighScore(isNew);
    stopCrowdAmbience();
    notifyGameplayStop();
    void persistGameData();
    void sendScoreToYouTube(finalScore.saves);
    setGameState('gameover');
  }, [gameMode, totalPoints, selectedDifficulty]);

  // Animation loop
  useEffect(() => {
    if (gameState !== 'shooting' || isPaused) return;

    const { base, increment } = DIFFICULTY_SPEEDS[selectedDifficulty];
    let speed = base + difficulty * increment;

    // Slow-mo power-up
    if (activePowerUp?.type === 'slowmo') {
      speed *= 0.6;
    }

    const animate = () => {
      setBallProgress(prev => {
        const next = Math.min(prev + speed, 1);
        if (next >= 1) {
          setTimeout(() => {
            // Wide dive: adjacent directions also count
            let isSaved = diveDirection === ballDirection;
            if (!isSaved && wideDiveActive && diveDirection) {
              const adjacency: Record<Direction, Direction[]> = {
                left: ['center'],
                center: ['left', 'right'],
                right: ['center'],
              };
              isSaved = adjacency[ballDirection]?.includes(diveDirection) ?? false;
            }
            setSaved(isSaved);

            if (isSaved) {
              playSaveSound();
              crowdCheer();
              hapticSave();

              // Combo system
              let newCombo = 1;
              if (diveDirection === comboDirection) {
                newCombo = Math.min(comboMultiplier + 1, 5);
              }
              setComboDirection(diveDirection);
              setComboMultiplier(newCombo);

              if (newCombo >= 2) {
                playComboSound(newCombo);
                setShowCombo(true);
                setTimeout(() => setShowCombo(false), 1000);
              }

              const pointsEarned = newCombo;
              setTotalPoints(p => p + pointsEarned);

              // Power-up check
              if (shouldAwardPowerUp(ballProgressAtDiveRef.current, true, activePowerUp)) {
                const puType = getRandomPowerUp();
                const pu: ActivePowerUp = { type: puType, roundsLeft: POWER_UP_CONFIG[puType].duration };
                setActivePowerUp(pu);
                setShowPowerUp(true);
                hapticPowerUp();
                setTimeout(() => setShowPowerUp(false), 1500);
              } else if (activePowerUp) {
                // Decrement power-up rounds
                const remaining = activePowerUp.roundsLeft - 1;
                if (remaining <= 0) {
                  setActivePowerUp(null);
                } else {
                  setActivePowerUp({ ...activePowerUp, roundsLeft: remaining });
                }
              }
            } else {
              playGoalSound();
              crowdGroan();
              hapticGoal();
              setScreenShake(true);
              setTimeout(() => setScreenShake(false), 400);
              setComboMultiplier(1);
              setComboDirection(null);
              // Lose power-up on goal
              setActivePowerUp(null);
            }

            setScore(prev => {
              const newStreak = isSaved ? prev.streak + 1 : 0;
              const newScore = {
                saves: prev.saves + (isSaved ? 1 : 0),
                goals: prev.goals + (isSaved ? 0 : 1),
                round: prev.round + 1,
                streak: newStreak,
                bestStreak: Math.max(prev.bestStreak, newStreak),
              };

              if (isSaved && newStreak > 0 && newStreak % 3 === 0) {
                playStreakSound();
                hapticStreak();
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 1600);
                setDifficulty(d => Math.min(d + 1, 8));
              }

              const isGameOver = gameMode === 'daily'
                ? (newScore.goals >= MAX_GOALS || newScore.round > getDailyRoundCount())
                : newScore.goals >= MAX_GOALS;

              if (isGameOver) {
                finalizeGameOver(newScore);
              } else {
                setGameState('result');
              }
              return newScore;
            });
          }, 100);
        }
        return next;
      });

      if (diveDirection) {
        setDiveProgress(prev => Math.min(prev + 0.06, 1));
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, diveDirection, ballDirection, difficulty, selectedDifficulty, comboDirection, comboMultiplier, activePowerUp, wideDiveActive, gameMode, totalPoints, isPaused, finalizeGameOver]);

  // Auto-start round after result
  useEffect(() => {
    if (gameState === 'result' && !isPaused) {
      const t = setTimeout(startRound, 1200);
      return () => clearTimeout(t);
    }
  }, [gameState, startRound, isPaused]);

  // Auto-start first round
  useEffect(() => {
    if (gameState === 'ready' && !isPaused) {
      const t = setTimeout(startRound, 600);
      return () => clearTimeout(t);
    }
  }, [gameState, startRound, isPaused]);

  // Cleanup crowd on unmount
  useEffect(() => {
    return () => stopCrowdAmbience();
  }, []);

  return {
    gameState, score, ballDirection, diveDirection, saved,
    ballProgress, diveProgress, difficulty, selectedDifficulty,
    screenShake, showConfetti, isNewHighScore,
    comboMultiplier, showCombo, totalPoints,
    gameMode, activePowerUp, showPowerUp,
    isPaused,
    startGame, handleDive, pauseGame, resumeGame,
  };
}
