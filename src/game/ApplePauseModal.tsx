import { isAudioMuted, setGameAudioEnabled } from './sounds';
import { areHapticsEnabled, setHapticsEnabled, hapticTap } from './haptics';
import { useState } from 'react';

interface ApplePauseModalProps {
  saves: number;
  streak: number;
  onResume: () => void;
  onRestart: () => void;
}

export function ApplePauseModal({ saves, streak, onResume, onRestart }: ApplePauseModalProps) {
  const [muted, setMuted] = useState(isAudioMuted());
  const [haptics, setHaptics] = useState(areHapticsEnabled());

  const toggleMute = () => {
    const next = !muted;
    setGameAudioEnabled(!next);
    setMuted(next);
    hapticTap();
  };

  const toggleHaptics = () => {
    const next = !haptics;
    setHapticsEnabled(next);
    setHaptics(next);
    hapticTap();
  };

  return (
    <div className=\"absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xl p-4 animate-in fade-in duration-200\">
      <div className=\"w-full max-w-xs apple-glass rounded-3xl p-6 flex flex-col items-center gap-5 text-center shadow-2xl\">
        {/* Apple Status Indicator */}
        <div className=\"w-12 h-12 rounded-full apple-glass-card flex items-center justify-center text-xl\">
          ⏸
        </div>

        <div className=\"flex flex-col gap-1\">
          <h3 className=\"font-display text-2xl font-bold text-foreground tracking-tight\">
            Match Paused
          </h3>
          <p className=\"text-xs text-muted-foreground\">
            Current Match: <span className=\"text-primary font-semibold\">{saves} saves</span> ·{' '}
            <span className=\"text-secondary font-semibold\">{streak} streak</span>
          </p>
        </div>

        {/* Quick Settings Grid */}
        <div className=\"w-full grid grid-cols-2 gap-2\">
          <button
            type=\"button\"
            onClick={toggleMute}
            className={`p-2.5 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1 transition-all active:scale-95 ${
              !muted ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 text-muted-foreground'
            }`}
          >
            <span className=\"text-base\">{!muted ? '🔊' : '🔇'}</span>
            <span>{!muted ? 'Sound On' : 'Muted'}</span>
          </button>

          <button
            type=\"button\"
            onClick={toggleHaptics}
            className={`p-2.5 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1 transition-all active:scale-95 ${
              haptics ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 text-muted-foreground'
            }`}
          >
            <span className=\"text-base\">📳</span>
            <span>{haptics ? 'Haptics On' : 'Off'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className=\"w-full flex flex-col gap-2\">
          <button
            type=\"button\"
            onClick={() => {
              hapticTap();
              onResume();
            }}
            className=\"apple-pill-primary w-full py-3 text-sm font-semibold tracking-wide\"
          >
            Resume Match
          </button>

          <button
            type=\"button\"
            onClick={() => {
              hapticTap();
              onRestart();
            }}
            className=\"apple-pill-secondary w-full py-2.5 text-xs text-muted-foreground hover:text-foreground\"
          >
            End Match & Restart
          </button>
        </div>
      </div>
    </div>
  );
}
