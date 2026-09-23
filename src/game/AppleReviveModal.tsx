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
          clearInterval(timer);\n          onDismiss();\n          return 0;\n        }\n        return prev - 1;\n      });\n    }, 1000);\n    return () => clearInterval(timer);\n  }, [loading, onDismiss]);\n\n  const handleWatchAd = async () => {\n    hapticTap();\n    setLoading(true);\n    const success = await onRevive();\n    setLoading(false);\n    if (!success) {\n      onDismiss();\n    }\n  };\n\n  return (\n    <div className=\"absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xl p-4 animate-in fade-in duration-200\">\n      <div className=\"w-full max-w-sm apple-glass rounded-3xl p-6 flex flex-col items-center gap-4 text-center shadow-2xl\">\n        {/* Countdown Pill & Icon */}\n        <div className=\"relative flex items-center justify-center\">\n          <div className=\"w-16 h-16 rounded-full apple-glass-card flex items-center justify-center text-3xl shadow-inner\">\n            🧤\n          </div>\n          <div className=\"absolute -top-1 -right-1 w-6 h-6 rounded-full bg-secondary text-secondary-foreground font-bold text-xs flex items-center justify-center shadow-md\">\n            {timeLeft}\n          </div>\n        </div>\n\n        <div className=\"flex flex-col gap-1\">\n          <div className=\"text-[11px] font-semibold text-secondary uppercase tracking-widest\">\n            Injury Time Save\n          </div>\n          <h3 className=\"font-display text-2xl font-bold text-foreground tracking-tight\">\n            Keep Your Match Alive?\n          </h3>\n          <p className=\"text-xs text-muted-foreground leading-relaxed max-w-[270px]\">\n            Watch a quick sponsor ad to erase 1 conceded goal and defend your current{' '}\n            <span className=\"text-secondary font-semibold\">{streak} save streak</span> ({saves} total saves)!\n          </p>\n        </div>\n\n        {/* Action Buttons */}\n        <div className=\"w-full flex flex-col gap-2 mt-1\">\n          <button\n            type=\"button\"\n            onClick={handleWatchAd}\n            disabled={loading}\n            className=\"apple-pill-primary w-full py-3.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2\"\n          >\n            <span>▶</span>\n            <span>{loading ? 'Opening Sponsor Video...' : 'Watch Ad to Revive'}</span>\n          </button>\n\n          <button\n            type=\"button\"\n            onClick={() => {\n              hapticTap();\n              onDismiss();\n            }}\n            disabled={loading}\n            className=\"text-xs text-muted-foreground hover:text-foreground py-1.5 transition-colors\"\n          >\n            No thanks, end match ({timeLeft}s)\n          </button>\n        </div>\n      </div>\n    </div>\n  );\n}\n