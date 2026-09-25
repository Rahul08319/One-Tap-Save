import { useEffect, useState } from 'react';
import { Difficulty } from './types';
import { getHighScores } from './highScores';
import { playMenuSelectSound } from './sounds';
import { areHapticsEnabled, hapticTap, setHapticsEnabled } from './haptics';
import { hasDailyBeenPlayed, getDailyRecord } from './dailyChallenge';
import { GameMode } from './useGameEngine';
import { GLOVES, getLeague, getPlayerProfile, selectGlove } from './playerProgress';
import { AccessibilitySettings, getAccessibilitySettings, saveAccessibilitySettings } from './accessibility';

interface MenuScreenProps {
  onStart: (difficulty: Difficulty, mode?: GameMode) => void;
}

const DIFF_CONFIG: { key: Difficulty; label: string; desc: string }[] = [
  { key: 'easy', label: 'Easy', desc: 'Slow, predictable penalty trajectories' },
  { key: 'medium', label: 'Medium', desc: 'Tournament speed with curve shots' },
  { key: 'hard', label: 'Pro', desc: 'Lightning-fast championship pace' },
];

export function MenuScreen({ onStart }: MenuScreenProps) {
  const [selected, setSelected] = useState<Difficulty>('medium');
  const [hapticsEnabled, setHapticsEnabledState] = useState(areHapticsEnabled());
  const [profile, setProfile] = useState(getPlayerProfile());
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(getAccessibilitySettings());

  const highScores = getHighScores();
  const dailyPlayed = hasDailyBeenPlayed();
  const dailyRecord = getDailyRecord();

  useEffect(() => {
    const refreshRestoredData = () => {
      setHapticsEnabledState(areHapticsEnabled());
      setProfile(getPlayerProfile());
      setAccessibility(getAccessibilitySettings());
    };
    window.addEventListener('otg-playables-data-restored', refreshRestoredData);
    return () => window.removeEventListener('otg-playables-data-restored', refreshRestoredData);
  }, []);

  const handleSelectDiff = (d: Difficulty) => {
    setSelected(d);
    playMenuSelectSound();
    hapticTap();
  };

  const updateAccessibility = (key: keyof AccessibilitySettings) => {
    const next = { ...accessibility, [key]: !accessibility[key] };
    setAccessibility(next);
    saveAccessibilitySettings(next);
    hapticTap();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/90 backdrop-blur-2xl px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center gap-4 my-auto">
        {/* Hero Title with Apple Optical Kerning */}
        <div className="flex flex-col items-center text-center">
          <div className="game-kicker mb-1">Night Match Penalty Challenge</div>
          <h1 className="font-display text-5xl sm:text-6xl font-semibold text-foreground tracking-tight leading-[0.95]">
            One Tap <span className="text-primary text-glow-primary">Goalkeeper</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-[280px] leading-relaxed">
            Tap left, center, or right to make heroic penalty saves. Three conceded goals and match ends.
          </p>
        </div>

        {/* Apple Segmented Control for Difficulty */}
        <div className="w-full apple-glass rounded-full p-1 flex">
          {DIFF_CONFIG.map((d) => {
            const isSel = selected === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => handleSelectDiff(d.key)}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSel
                    ? 'bg-primary text-primary-foreground shadow-sm scale-100'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        <div className="text-[11px] text-muted-foreground -mt-2">
          {DIFF_CONFIG.find((d) => d.key === selected)?.desc}
        </div>

        {/* Best Score Summary */}
        {highScores[selected].saves > 0 && (
          <div className="apple-glass-card rounded-2xl px-6 py-2 flex items-center gap-6">
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-primary leading-none">
                {highScores[selected].saves}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
                Record Saves
              </div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-secondary leading-none">
                {highScores[selected].bestStreak}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
                Best Streak
              </div>
            </div>
          </div>
        )}

        {/* Glove Locker / Customization Tile */}
        <div className="w-full apple-glass-card rounded-2xl p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            <span>{getLeague(profile)} League</span>
            <span>{profile.xp} XP</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {(Object.keys(GLOVES) as Array<keyof typeof GLOVES>).map((id) => {
              const glove = GLOVES[id];
              const unlocked = profile.xp >= glove.unlockXp;
              const isSelected = profile.selectedGlove === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => {
                    setProfile(selectGlove(id));
                    hapticTap();
                  }}
                  className={`rounded-xl p-1.5 flex flex-col items-center gap-0.5 border text-center transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/15'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  } ${unlocked ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
                >
                  <span className="text-base" style={{ filter: `drop-shadow(0 0 4px ${glove.color})` }}>
                    🧤
                  </span>
                  <span className="text-[8px] font-semibold text-foreground truncate w-full">
                    {unlocked ? glove.label.split(' ')[0] : `${glove.unlockXp} XP`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Play & Daily Challenge */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              hapticTap();
              onStart(selected, 'classic');
            }}
            className="apple-pill-primary w-full py-4 text-lg font-semibold tracking-wide flex items-center justify-center gap-2"
          >
            <span>Kick Off Match</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              onStart('medium', 'daily');
            }}
            className={`w-full py-3 rounded-full text-xs font-semibold tracking-wide transition-all border ${
              dailyPlayed
                ? 'border-white/10 text-muted-foreground bg-white/5'
                : 'border-secondary/60 text-secondary bg-secondary/10 hover:bg-secondary/15 animate-pulse'
            }`}
          >
            {dailyPlayed
              ? `Daily Challenge Completed (${dailyRecord?.saves || 0} saves)`
              : '📅 Play Daily Challenge'}
          </button>
        </div>

        {/* Accessibility & Haptics Toggles */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap justify-center">
          <button
            type="button"
            onClick={() => {
              const next = !hapticsEnabled;
              setHapticsEnabled(next);
              setHapticsEnabledState(next);
            }}
            className={`px-2.5 py-1 rounded-full border transition-all ${
              hapticsEnabled ? 'border-primary text-primary' : 'border-white/10 text-muted-foreground'
            }`}
          >
            Haptics: {hapticsEnabled ? 'On' : 'Off'}
          </button>

          <button
            type="button"
            onClick={() => updateAccessibility('reducedMotion')}
            className={`px-2.5 py-1 rounded-full border transition-all ${
              accessibility.reducedMotion ? 'border-primary text-primary' : 'border-white/10 text-muted-foreground'
            }`}
          >
            Reduced Motion
          </button>

          <button
            type="button"
            onClick={() => updateAccessibility('highContrast')}
            className={`px-2.5 py-1 rounded-full border transition-all ${
              accessibility.highContrast ? 'border-primary text-primary' : 'border-white/10 text-muted-foreground'
            }`}
          >
            High Contrast
          </button>
        </div>
      </div>
    </div>
  );
}
