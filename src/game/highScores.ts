import { Difficulty, HighScores, GameScore } from './types';

const STORAGE_KEY = 'otg_high_scores';

const defaultScores: HighScores = {
  easy: { saves: 0, bestStreak: 0, rounds: 0 },
  medium: { saves: 0, bestStreak: 0, rounds: 0 },
  hard: { saves: 0, bestStreak: 0, rounds: 0 },
};

export function getHighScores(): HighScores {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultScores, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultScores };
}

export function updateHighScore(difficulty: Difficulty, score: GameScore): boolean {
  const scores = getHighScores();
  const current = scores[difficulty];
  let isNew = false;

  if (score.saves > current.saves) {
    current.saves = score.saves;
    isNew = true;
  }
  if (score.bestStreak > current.bestStreak) {
    current.bestStreak = score.bestStreak;
    isNew = true;
  }
  const rounds = score.round - 1;
  if (rounds > current.rounds) {
    current.rounds = rounds;
    isNew = true;
  }

  scores[difficulty] = current;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  return isNew;
}
