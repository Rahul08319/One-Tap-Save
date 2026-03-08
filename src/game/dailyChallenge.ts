import { Direction } from './types';

// Seeded pseudo-random number generator (mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

const DAILY_ROUNDS = 15; // Fixed number of rounds per daily challenge

export function getDailyShotSequence(): Direction[] {
  const rng = mulberry32(getDateSeed());
  const dirs: Direction[] = ['left', 'center', 'right'];
  const sequence: Direction[] = [];
  for (let i = 0; i < DAILY_ROUNDS; i++) {
    sequence.push(dirs[Math.floor(rng() * 3)]);
  }
  return sequence;
}

export function getDailyRoundCount(): number {
  return DAILY_ROUNDS;
}

// Daily challenge scoring stored in localStorage
const DAILY_KEY = 'otg_daily_challenge';

interface DailyRecord {
  date: string;
  saves: number;
  totalPoints: number;
  completed: boolean;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDailyRecord(): DailyRecord | null {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const record: DailyRecord = JSON.parse(raw);
    if (record.date === todayKey()) return record;
  } catch {}
  return null;
}

export function saveDailyRecord(saves: number, totalPoints: number): boolean {
  const existing = getDailyRecord();
  const isNew = !existing || totalPoints > existing.totalPoints;
  if (isNew) {
    const record: DailyRecord = {
      date: todayKey(),
      saves,
      totalPoints,
      completed: true,
    };
    localStorage.setItem(DAILY_KEY, JSON.stringify(record));
  }
  return isNew;
}

export function hasDailyBeenPlayed(): boolean {
  const record = getDailyRecord();
  return record?.completed ?? false;
}
