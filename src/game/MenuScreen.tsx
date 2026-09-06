import { useState } from 'react';
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

const DIFF_CONFIG: { key: Difficulty; label: string; desc: string; color: string }[] = [
  { key: 'easy', label: 'EASY', desc: 'Slow shots', color: 'text-primary' },
  { key: 'medium', label: 'MEDIUM', desc: 'Normal speed', color: 'text-secondary' },
  { key: 'hard', label: 'HARD', desc: 'Lightning fast', color: 'text-accent' },
];

export function MenuScreen({ onStart }: MenuScreenProps) {
  const [selected, setSelected] = useState<Difficulty>('medium');
  const [hapticsEnabled, setHapticsEnabledState] = useState(areHapticsEnabled());
  const [profile, setProfile] = useState(getPlayerProfile());
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(getAccessibilitySettings());
  const highScores = getHighScores();
  const dailyPlayed = hasDailyBeenPlayed();
  const dailyRecord = getDailyRecord();

  const handleSelect = (d: Difficulty) => {
    setSelected(d);
    playMenuSelectSound();
    hapticTap();
  };

  const updateAccessibility = (key: keyof AccessibilitySettings) => {
    const next = { ...accessibility, [key]: !accessibility[key] };
    setAccessibility(next);
    saveAccessibilitySettings(next);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/95">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="text-7xl mb-2">🧤</div>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl text-foreground text-center leading-none tracking-wide">
          ONE TAP
          <br />
          <span className="text-primary text-glow-primary">GOALKEEPER</span>
        </h1>

        <p className="text-muted-foreground text-sm text-center max-w-[250px]">
          Tap left, center or right to dive and save the shot. 3 goals and you're out!
        </p>

        <button
          type="button"
          onClick={() => {
            const next = !hapticsEnabled;
            setHapticsEnabled(next);
            setHapticsEnabledState(next);
          }}
          className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          aria-pressed={hapticsEnabled}
        >
          Haptics: {hapticsEnabled ? 'On' : 'Off'}
        </button>

        <div className="w-[280px] rounded-lg border border-border bg-muted/30 px-3 py-2">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>{getLeague(profile)} League</span><span>{profile.seasonSaves} season saves</span>
          </div>
          <div className="mt-2 flex gap-1.5">
            {(Object.keys(GLOVES) as Array<keyof typeof GLOVES>).map(id => {
              const glove = GLOVES[id];
              const unlocked = profile.xp >= glove.unlockXp;
              return (
                <button key={id} type="button" disabled={!unlocked} onClick={() => setProfile(selectGlove(id))}
                  className={`flex-1 rounded border px-1 py-1 text-[9px] ${profile.selectedGlove === id ? 'border-primary bg-primary/10' : 'border-border'} ${unlocked ? '' : 'opacity-40'}`}>
                  <span style={{ color: glove.color }}>🧤</span> {unlocked ? glove.label.split(' ')[0] : `${glove.unlockXp} XP`}
                </button>
              );
            })}
          </div>
          <div className="mt-1 text-center text-[9px] text-muted-foreground">{profile.xp} XP · unlock gloves by earning points</div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-[290px] text-[9px] uppercase tracking-wider text-muted-foreground">
          {([
            ['reducedMotion', 'Reduce motion'],
            ['highContrast', 'High contrast'],
            ['leftHanded', 'Left-handed'],
          ] as Array<[keyof AccessibilitySettings, string]>).map(([key, label]) => (
            <button key={key} type="button" onClick={() => updateAccessibility(key)} aria-pressed={accessibility[key]}
              className={`rounded border px-2 py-1 ${accessibility[key] ? 'border-primary text-primary' : 'border-border'}`}>
              {label}: {accessibility[key] ? 'On' : 'Off'}
            </button>
          ))}
        </div>

        {/* Difficulty selector */}
        <div className="flex gap-2 mt-2">
          {DIFF_CONFIG.map(d => (
            <button
              key={d.key}
              onClick={() => handleSelect(d.key)}
              className={`px-4 py-2 rounded-lg font-display text-lg tracking-wider transition-all ${
                selected === d.key
                  ? `${d.color} bg-muted border-2 border-current scale-105`
                  : 'text-muted-foreground border-2 border-transparent hover:border-muted-foreground/30'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          {DIFF_CONFIG.find(d => d.key === selected)?.desc}
        </p>

        {/* High score for selected difficulty */}
        {highScores[selected].saves > 0 && (
          <div className="flex gap-4 text-center">
            <div>
              <span className="font-display text-2xl text-primary text-glow-primary">{highScores[selected].saves}</span>
              <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">Best Saves</span>
            </div>
            <div>
              <span className="font-display text-2xl text-secondary text-glow-secondary">{highScores[selected].bestStreak}</span>
              <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">Best Streak</span>
            </div>
          </div>
        )}

        <button
          onClick={() => onStart(selected, 'classic')}
          className="mt-2 px-10 py-4 bg-primary text-primary-foreground font-display text-2xl tracking-wider rounded-lg box-glow-primary active:scale-95 transition-transform"
        >
          PLAY
        </button>

        {/* Daily Challenge */}
        <button
          onClick={() => onStart('medium', 'daily')}
          className={`px-8 py-3 font-display text-lg tracking-wider rounded-lg active:scale-95 transition-transform border-2 ${
            dailyPlayed
              ? 'border-muted-foreground/30 text-muted-foreground'
              : 'border-secondary text-secondary box-glow-secondary animate-pulse'
          }`}
        >
          📅 DAILY CHALLENGE
        </button>
        {dailyPlayed && dailyRecord && (
          <span className="text-[10px] text-muted-foreground -mt-3">
            Today: {dailyRecord.saves} saves · {dailyRecord.totalPoints} pts
          </span>
        )}
      </div>
    </div>
  );
}
