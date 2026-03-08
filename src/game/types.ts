export type Direction = 'left' | 'center' | 'right';

export type GameState = 'menu' | 'ready' | 'shooting' | 'result' | 'gameover';

export interface Ball {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  direction: Direction;
  progress: number;
}

export interface Goalkeeper {
  x: number;
  y: number;
  diveDirection: Direction | null;
  diveProgress: number;
}

export interface GameScore {
  saves: number;
  goals: number;
  round: number;
  streak: number;
  bestStreak: number;
}
