import { useState } from 'react';
import { Difficulty } from './types';
import { getHighScores } from './highScores';
import { playMenuSelectSound } from './sounds';
import { hapticTap } from './haptics';
import { hasDailyBeenPlayed, getDailyRecord } from './dailyChallenge';
import { GameMode } from './useGameEngine';

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
  const highScores = getHighScores();
  const dailyPlayed = hasDailyBeenPlayed();
  const dailyRecord = getDailyRecord();

  const handleSelect = (d: Difficulty) => {
    setSelected(d);
    playMenuSelectSound();
    hapticTap();
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
