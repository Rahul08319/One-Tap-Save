import { useState, useCallback, useRef, useEffect } from 'react';
import { Direction, GameState, GameScore } from './types';

const MAX_GOALS = 3;

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
  const animFrameRef = useRef<number>(0);
  const shootTimeRef = useRef<number>(0);
  const hasInputRef = useRef(false);

  const getRandomDirection = (): Direction => {
    const dirs: Direction[] = ['left', 'center', 'right'];
    return dirs[Math.floor(Math.random() * dirs.length)];
  };

  const startGame = useCallback(() => {
    setScore({ saves: 0, goals: 0, round: 1, streak: 0, bestStreak: 0 });
    setDifficulty(1);
    setGameState('ready');
  }, []);

  const startRound = useCallback(() => {
    const dir = getRandomDirection();
    setBallDirection(dir);
    setDiveDirection(null);
    setSaved(null);
    setBallProgress(0);
    setDiveProgress(0);
    hasInputRef.current = false;
    setGameState('shooting');
    shootTimeRef.current = performance.now();
  }, []);

  const handleDive = useCallback((dir: Direction) => {
    if (hasInputRef.current || gameState !== 'shooting') return;
    hasInputRef.current = true;
    setDiveDirection(dir);
  }, [gameState]);

  // Animation loop
  useEffect(() => {
    if (gameState !== 'shooting') return;

    const speed = 0.015 + difficulty * 0.003;

    const animate = () => {
      setBallProgress(prev => {
        const next = Math.min(prev + speed, 1);
        if (next >= 1) {
          // Resolve
          setTimeout(() => {
            const isSaved = diveDirection === ballDirection;
            setSaved(isSaved);
            setScore(prev => {
              const newStreak = isSaved ? prev.streak + 1 : 0;
              const newScore = {
                saves: prev.saves + (isSaved ? 1 : 0),
                goals: prev.goals + (isSaved ? 0 : 1),
                round: prev.round + 1,
                streak: newStreak,
                bestStreak: Math.max(prev.bestStreak, newStreak),
              };
              if (newScore.goals >= MAX_GOALS) {
                setGameState('gameover');
              } else {
                setGameState('result');
              }
              if (isSaved && newStreak % 3 === 0) {
                setDifficulty(d => Math.min(d + 1, 8));
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
  }, [gameState, diveDirection, ballDirection, difficulty]);

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

  return {
    gameState, score, ballDirection, diveDirection, saved,
    ballProgress, diveProgress, difficulty,
    startGame, handleDive,
  };
}
