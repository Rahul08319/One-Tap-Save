import { useState } from 'react';
import { Difficulty } from './types';
import { getHighScores } from './highScores';
import { playMenuSelectSound } from './sounds';
import { areHapticsEnabled, hapticTap, setHapticsEnabled } from './haptics';
import { hasDailyBeenPlayed, getDailyRecord } from './dailyChallenge';
import { GameMode } from './useGameEngine';
import { GLOVES, getLeague, getPlayerProfile, selectGlove } from './playerProgress';
import { AccessibilitySettings, getAccessibilitySettings, saveAccessibilitySettings } from './accessibility';
import { getCurrentPlatform, setTargetPlatform } from './youtubePlayables';
import { PlatformType } from './platform/types';

interface MenuScreenProps {
  onStart: (difficulty: Difficulty, mode?: GameMode) => void;
}

const DIFF_CONFIG: { key: Difficulty; label: string; desc: string }[] = [\n  { key: 'easy', label: 'Easy', desc: 'Slow, predictable penalty trajectories' },
  { key: 'medium', label: 'Medium', desc: 'Tournament speed with curve shots' },
  { key: 'hard', label: 'Pro', desc: 'Lightning-fast championship pace' },
];

const PLATFORMS: { key: PlatformType; label: string }[] = [
  { key: 'youtube', label: 'YouTube Playables' },
  { key: 'poki', label: 'Poki' },
  { key: 'crazygames', label: 'CrazyGames' },
  { key: 'facebook', label: 'Facebook Instant' },
  { key: 'yandex', label: 'Yandex Games' },
  { key: 'gamedistribution', label: 'GameDistribution' },
  { key: 'discord', label: 'Discord Activities' },
  { key: 'jiogames', label: 'JioGames' },
  { key: 'y8', label: 'Y8 Games' },
  { key: 'lagged', label: 'Lagged' },
  { key: 'msstore', label: 'Microsoft Store (PWA)' },
  { key: 'quickgames', label: 'Huawei/Xiaomi Quick Games' },
  { key: 'reddit', label: 'Reddit Games (Devvit)' },
  { key: 'msn', label: 'MSN Games' },
  { key: 'standalone', label: 'Standalone Web' },
];

export function MenuScreen({ onStart }: MenuScreenProps) {
  const [selected, setSelected] = useState<Difficulty>('medium');
  const [hapticsEnabled, setHapticsEnabledState] = useState(areHapticsEnabled());
  const [profile, setProfile] = useState(getPlayerProfile());
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(getAccessibilitySettings());
  const [activePlatform, setActivePlatform] = useState<PlatformType>(getCurrentPlatform());
  const [showPlatformSheet, setShowPlatformSheet] = useState(false);

  const highScores = getHighScores();
  const dailyPlayed = hasDailyBeenPlayed();
  const dailyRecord = getDailyRecord();

  const handleSelectDiff = (d: Difficulty) => {
    setSelected(d);
    playMenuSelectSound();
    hapticTap();
  };

  const handlePlatformChange = (p: PlatformType) => {
    setTargetPlatform(p);
    setActivePlatform(p);
    setShowPlatformSheet(false);
    hapticTap();
  };

  const updateAccessibility = (key: keyof AccessibilitySettings) => {
    const next = { ...accessibility, [key]: !accessibility[key] };
    setAccessibility(next);
    saveAccessibilitySettings(next);
    hapticTap();
  };

  return (
    <div className=\"absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/90 backdrop-blur-2xl px-4 py-6 overflow-y-auto\">
      <div className=\"w-full max-w-sm flex flex-col items-center gap-4 my-auto\">
        {/* Platform Indicator Chip */}
        <button
          type=\"button\"
          onClick={() => setShowPlatformSheet(true)}
          className=\"apple-glass rounded-full px-3 py-1 flex items-center gap-1.5 active:scale-95 transition-transform\"
        >
          <span className=\"w-2 h-2 rounded-full bg-primary\" />
          <span className=\"text-[11px] font-medium text-foreground\">
            {PLATFORMS.find((p) => p.key === activePlatform)?.label || activePlatform}
          </span>
          <span className=\"text-[10px] text-muted-foreground\">▾</span>
        </button>

        {/* Hero Title with Apple Optical Kerning */}
        <div className=\"flex flex-col items-center text-center\">
          <div className=\"game-kicker mb-1\">Night Match Penalty Challenge</div>
          <h1 className=\"font-display text-5xl sm:text-6xl font-semibold text-foreground tracking-tight leading-[0.95]\">
            One Tap <span className=\"text-primary text-glow-primary\">Goalkeeper</span>
          </h1>
          <p className=\"text-xs text-muted-foreground mt-2 max-w-[280px] leading-relaxed\">
            Tap left, center, or right to make heroic penalty saves. Three conceded goals and match ends.
          </p>
        </div>

        {/* Apple Segmented Control for Difficulty */}
        <div className=\"w-full apple-glass rounded-full p-1 flex\">
          {DIFF_CONFIG.map((d) => {
            const isSel = selected === d.key;
            return (
              <button
                key={d.key}
                type=\"button\"
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
        <div className=\"text-[11px] text-muted-foreground -mt-2\">
          {DIFF_CONFIG.find((d) => d.key === selected)?.desc}
        </div>

        {/* Best Score Summary */}
        {highScores[selected].saves > 0 && (
          <div className=\"apple-glass-card rounded-2xl px-6 py-2 flex items-center gap-6\">
            <div className=\"text-center\">
              <div className=\"font-display text-2xl font-bold text-primary leading-none\">
                {highScores[selected].saves}
              </div>
              <div className=\"text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5\">
                Record Saves
              </div>
            </div>
            <div className=\"h-6 w-px bg-white/10\" />
            <div className=\"text-center\">
              <div className=\"font-display text-2xl font-bold text-secondary leading-none\">
                {highScores[selected].bestStreak}
              </div>
              <div className=\"text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5\">
                Best Streak
              </div>
            </div>
          </div>
        )}

        {/* Glove Locker / Customization Tile */}
        <div className=\"w-full apple-glass-card rounded-2xl p-3 flex flex-col gap-2\">
          <div className=\"flex justify-between items-center text-[10px] uppercase font-semibold text-muted-foreground tracking-wider\">
            <span>{getLeague(profile)} League</span>
            <span>{profile.xp} XP</span>
          </div>

          <div className=\"grid grid-cols-4 gap-1.5\">
            {(Object.keys(GLOVES) as Array<keyof typeof GLOVES>).map((id) => {
              const glove = GLOVES[id];
              const unlocked = profile.xp >= glove.unlockXp;\n              const isSelected = profile.selectedGlove === id;\n              return (\n                <button\n                  key={id}\n                  type=\"button\"\n                  disabled={!unlocked}\n                  onClick={() => {\n                    setProfile(selectGlove(id));\n                    hapticTap();\n                  }}\n                  className={`rounded-xl p-1.5 flex flex-col items-center gap-0.5 border text-center transition-all ${\n                    isSelected\n                      ? 'border-primary bg-primary/15'\n                      : 'border-white/10 bg-white/5 hover:border-white/20'\n                  } ${unlocked ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}\n                >\n                  <span className=\"text-base\" style={{ filter: `drop-shadow(0 0 4px ${glove.color})` }}>\n                    🧤\n                  </span>\n                  <span className=\"text-[8px] font-semibold text-foreground truncate w-full\">\n                    {unlocked ? glove.label.split(' ')[0] : `${glove.unlockXp} XP`}\n                  </span>\n                </button>\n              );\n            })}\n          </div>\n        </div>\n\n        {/* Action Buttons: Play & Daily Challenge */}\n        <div className=\"w-full flex flex-col gap-2.5\">\n          <button\n            type=\"button\"\n            onClick={() => {\n              hapticTap();\n              onStart(selected, 'classic');\n            }}\n            className=\"apple-pill-primary w-full py-4 text-lg font-semibold tracking-wide flex items-center justify-center gap-2\"\n          >\n            <span>Kick Off Match</span>\n            <span>→</span>\n          </button>\n\n          <button\n            type=\"button\"\n            onClick={() => {\n              hapticTap();\n              onStart('medium', 'daily');\n            }}\n            className={`w-full py-3 rounded-full text-xs font-semibold tracking-wide transition-all border ${\n              dailyPlayed\n                ? 'border-white/10 text-muted-foreground bg-white/5'\n                : 'border-secondary/60 text-secondary bg-secondary/10 hover:bg-secondary/15 animate-pulse'\n            }`}\n          >\n            {dailyPlayed\n              ? `Daily Challenge Completed (${dailyRecord?.saves || 0} saves)`\n              : '📅 Play Daily Challenge'}\n          </button>\n        </div>\n\n        {/* Accessibility & Haptics Toggles */}\n        <div className=\"flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap justify-center\">\n          <button\n            type=\"button\"\n            onClick={() => {\n              const next = !hapticsEnabled;\n              setHapticsEnabled(next);\n              setHapticsEnabledState(next);\n            }}\n            className={`px-2.5 py-1 rounded-full border transition-all ${\n              hapticsEnabled ? 'border-primary text-primary' : 'border-white/10 text-muted-foreground'\n            }`}\n          >\n            Haptics: {hapticsEnabled ? 'On' : 'Off'}\n          </button>\n\n          <button\n            type=\"button\"\n            onClick={() => updateAccessibility('reducedMotion')}\n            className={`px-2.5 py-1 rounded-full border transition-all ${\n              accessibility.reducedMotion ? 'border-primary text-primary' : 'border-white/10 text-muted-foreground'\n            }`}\n          >\n            Reduced Motion\n          </button>\n\n          <button\n            type=\"button\"\n            onClick={() => updateAccessibility('highContrast')}\n            className={`px-2.5 py-1 rounded-full border transition-all ${\n              accessibility.highContrast ? 'border-primary text-primary' : 'border-white/10 text-muted-foreground'\n            }`}\n          >\n            High Contrast\n          </button>\n        </div>\n      </div>\n\n      {/* Platform Selector Bottom Sheet Modal */}\n      {showPlatformSheet && (\n        <div className=\"absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200\">\n          <div className=\"w-full max-w-sm apple-glass rounded-3xl p-5 flex flex-col gap-3 shadow-2xl\">\n            <div className=\"flex justify-between items-center\">\n              <span className=\"text-sm font-semibold text-foreground\">Select Target Platform</span>\n              <button\n                type=\"button\"\n                onClick={() => setShowPlatformSheet(false)}\n                className=\"w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs\"\n              >\n                ✕\n              </button>\n            </div>\n            <p className=\"text-[11px] text-muted-foreground\">\n              Switch adapter mode without reloading or external SDK aggregators:\n            </p>\n\n            <div className=\"max-h-60 overflow-y-auto flex flex-col gap-1 pr-1\">\n              {PLATFORMS.map((p) => {\n                const isActive = activePlatform === p.key;\n                return (\n                  <button\n                    key={p.key}\n                    type=\"button\"\n                    onClick={() => handlePlatformChange(p.key)}\n                    className={`p-2.5 rounded-xl text-left text-xs font-medium flex justify-between items-center transition-all ${\n                      isActive\n                        ? 'bg-primary text-primary-foreground font-semibold'\n                        : 'hover:bg-white/5 text-foreground'\n                    }`}\n                  >\n                    <span>{p.label}</span>\n                    {isActive && <span>✓</span>}\n                  </button>\n                );\n              })}\n            </div>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n}\n