export type PowerUpType = 'slowmo' | 'widedive';

export interface ActivePowerUp {
  type: PowerUpType;
  roundsLeft: number;
}

export const POWER_UP_CONFIG: Record<PowerUpType, { label: string; emoji: string; duration: number; description: string }> = {
  slowmo: { label: 'SLOW-MO', emoji: '⏳', duration: 3, description: 'Ball moves slower' },
  widedive: { label: 'WIDE DIVE', emoji: '🦅', duration: 3, description: 'Wider catch range' },
};

// A "last-second" save is when the player dives very late (ball progress > threshold when they input)
export const LATE_DIVE_THRESHOLD = 0.65;

export function getRandomPowerUp(): PowerUpType {
  const types: PowerUpType[] = ['slowmo', 'widedive'];
  return types[Math.floor(Math.random() * types.length)];
}

export function shouldAwardPowerUp(ballProgressAtDive: number, isSaved: boolean, currentPowerUp: ActivePowerUp | null): boolean {
  // Award power-up on last-second saves when no power-up is active
  return isSaved && ballProgressAtDive >= LATE_DIVE_THRESHOLD && !currentPowerUp;
}
