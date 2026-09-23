import { useEffect, useState } from 'react';
import { hapticTap } from './haptics';

interface AppleReviveModalProps {
  streak: number;
  saves: number;
  onRevive: () => Promise<boolean>;
  onDismiss: () => void;
}

export function AppleReviveModal({ streak, saves, onRevive, onDismiss }: AppleReviveModalProps) {
  const [timeLeft, setTimeLeft] = useState(6);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, onDismiss]);

  const handleWatchAd = async () => {
    hapticTap();
    setLoading(true);
    const success = await onRevive();
    setLoading(false);
    if (!success) {
      onDismiss();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm apple-glass rounded-3xl p-6 flex flex-col items-center gap-4 text-center shadow-2xl">
        {/* Countdown Pill & Icon */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full apple-glass-card flex items-center justify-center text-3xl shadow-inner">
            🧤
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-secondary text-secondary-foreground font-bold text-xs flex items-center justify-center shadow-md">
            {timeLeft}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-[11px] font-semibold text-secondary uppercase tracking-widest">
            Injury Time Save
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground tracking-tight">
            Keep Your Match Alive?
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[270px]">
            Watch a quick sponsor ad to erase 1 conceded goal and defend your current{' '}
            <span className="text-secondary font-semibold">{streak} save streak</span> ({saves} total saves)!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 mt-1">
          <button
            type="button"
            onClick={handleWatchAd}
            disabled={loading}
            className="apple-pill-primary w-full py-3.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
          >
            <span>▶</span>
            <span>{loading ? 'Opening Sponsor Video...' : 'Watch Ad to Revive'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              onDismiss();
            }}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground py-1.5 transition-colors"
          >
            No thanks, end match ({timeLeft}s)
          </button>
        </div>
      </div>
    </div>
  );
}
