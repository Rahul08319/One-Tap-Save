import { persistGameData } from './youtubePlayables';

export type GloveId = 'classic' | 'neon' | 'crimson';

export interface PlayerProfile {
  xp: number;
  season: string;
  seasonSaves: number;
  selectedGlove: GloveId;
}

export const GLOVES: Record<GloveId, { label: string; color: string; unlockXp: number }> = {
  classic: { label: 'Classic Gold', color: '#ffcc00', unlockXp: 0 },
  neon: { label: 'Neon Pulse', color: '#4dffea', unlockXp: 50 },
  crimson: { label: 'Crimson Guard', color: '#ff4d6d', unlockXp: 150 },
};

const KEY = 'otg_player_profile';
const seasonId = () => new Date().toISOString().slice(0, 7);

export function getPlayerProfile(): PlayerProfile {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<PlayerProfile>;
    return {
      xp: saved.xp || 0,
      season: saved.season === seasonId() ? saved.season : seasonId(),
      seasonSaves: saved.season === seasonId() ? saved.seasonSaves || 0 : 0,
      selectedGlove: saved.selectedGlove || 'classic',
    };
  } catch {
    return { xp: 0, season: seasonId(), seasonSaves: 0, selectedGlove: 'classic' };
  }
}

function save(profile: PlayerProfile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event('otg-profile-change'));
  void persistGameData();
  return profile;
}

export function recordMatch(saves: number, points: number) {
  const current = getPlayerProfile();
  return save({ ...current, xp: current.xp + Math.max(1, points), seasonSaves: current.seasonSaves + saves });
}

export function selectGlove(id: GloveId) {
  const current = getPlayerProfile();
  if (current.xp < GLOVES[id].unlockXp) return current;
  return save({ ...current, selectedGlove: id });
}

export function getLeague(profile = getPlayerProfile()) {
  if (profile.seasonSaves >= 75) return 'Champions';
  if (profile.seasonSaves >= 35) return 'Premier';
  if (profile.seasonSaves >= 12) return 'Pro';
  return 'Rookie';
}
