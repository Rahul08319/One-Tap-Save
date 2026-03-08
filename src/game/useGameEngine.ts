import { useState, useCallback, useRef, useEffect } from 'react';
import { Direction, GameState, GameScore, Difficulty } from './types';
import { playKickSound, playSaveSound, playGoalSound, playStreakSound, playComboSound, startCrowdAmbience, stopCrowdAmbience, crowdCheer, crowdGroan } from './sounds';
import { updateHighScore } from './highScores';

const MAX_GOALS = 3;

const DIFFICULTY_SPEEDS: Record<Difficulty, { base: number; increment: number }> = {
  easy: { base: 0.012, increment: 0.002 },
  medium: { base: 0.018, increment: 0.003 },
  hard: { base: 0.025, increment: 0.004 },
};

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
  const animFrameRef = useRef<number>(0);
  const hasInputRef = useRef(false);

  const getRandomDirection = (): Direction => {
    const dirs: Direction[] = ['left', 'center', 'right'];
    return dirs[Math.floor(Math.random() * dirs.length)];
  };

  const startGame = useCallback((diff?: Difficulty) => {
    const d = diff || selectedDifficulty;
    setSelectedDifficulty(d);
    setScore({ saves: 0, goals: 0, round: 1, streak: 0, bestStreak: 0 });
    setDifficulty(1);
    setIsNewHighScore(false);
    setComboMultiplier(1);
    setComboDirection(null);
    setTotalPoints(0);
    setGameState('ready');
    startCrowdAmbience();
  }, [selectedDifficulty]);

  const startRound = useCallback(() => {
    const dir = getRandomDirection();
    setBallDirection(dir);
    setDiveDirection(null);
    setSaved(null);
    setBallProgress(0);
    setDiveProgress(0);
    hasInputRef.current = false;
    setShowCombo(false);
    setGameState('shooting');
    playKickSound();
  }, []);

  const handleDive = useCallback((dir: Direction) => {
    if (hasInputRef.current || gameState !== 'shooting') return;
    hasInputRef.current = true;
    setDiveDirection(dir);
  }, [gameState]);

  // Animation loop
  useEffect(() => {
    if (gameState !== 'shooting') return;

    const { base, increment } = DIFFICULTY_SPEEDS[selectedDifficulty];
    const speed = base + difficulty * increment;

    const animate = () => {
      setBallProgress(prev => {
        const next = Math.min(prev + speed, 1);
        if (next >= 1) {
          setTimeout(() => {
            const isSaved = diveDirection === ballDirection;
            setSaved(isSaved);

            if (isSaved) {
              playSaveSound();
              crowdCheer();

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
            } else {
              playGoalSound();
              crowdGroan();
              setScreenShake(true);
              setTimeout(() => setScreenShake(false), 400);
              setComboMultiplier(1);
              setComboDirection(null);
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
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 1600);
                setDifficulty(d => Math.min(d + 1, 8));
              }

              if (newScore.goals >= MAX_GOALS) {
                const isNew = updateHighScore(selectedDifficulty, newScore);
                setIsNewHighScore(isNew);
                stopCrowdAmbience();
                setGameState('gameover');
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
  }, [gameState, diveDirection, ballDirection, difficulty, selectedDifficulty, comboDirection, comboMultiplier]);

  // Auto-start round after result
  useEffect(() => {
    if (gameState === 'result') {
      const t = setTimeout(startRound, 1200);
      return () => clearTimeout(t);
    }
  }, [gameState, startRound]);

  // Auto-start first round
  useEffect(() => {
    if (gameState === 'ready') {
      const t = setTimeout(startRound, 600);
      return () => clearTimeout(t);
    }
  }, [gameState, startRound]);

  // Cleanup crowd on unmount
  useEffect(() => {
    return () => stopCrowdAmbience();
  }, []);

  return {
    gameState, score, ballDirection, diveDirection, saved,
    ballProgress, diveProgress, difficulty, selectedDifficulty,
    screenShake, showConfetti, isNewHighScore,
    comboMultiplier, showCombo, totalPoints,
    startGame, handleDive,
  };
}
