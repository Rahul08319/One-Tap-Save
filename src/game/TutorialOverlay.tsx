import { useState } from 'react';
import { hapticTap } from './haptics';

const TUTORIAL_KEY = 'otg_tutorial_seen';

interface TutorialOverlayProps {
  onDismiss: () => void;
}

export function TutorialOverlay({ onDismiss }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      emoji: '⚽',
      title: 'Incoming Penalty!',
      desc: 'A shot will fly toward your goal frame. Track the ball direction and react before it crosses the goal line.',
    },
    {
      emoji: '🧤',
      title: 'Direct Your Dive',
      desc: 'Tap Left, Center, or Right on the bottom screen to make the reflex save.',
      showZones: true,
    },
    {
      emoji: '🔥',
      title: 'Build Save Combos',
      desc: 'Consecutive saves in identical zones build up multiplier bonuses and grant power-ups like Slow-Mo & Wide-Dives.',
    },
    {
      emoji: '🏆',
      title: 'Climb the Global Ranks',
      desc: 'Concede 3 goals and the whistle blows. Submit high scores to YouTube and platform leaderboards!',
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    hapticTap();
    if (isLast) {
      localStorage.setItem(TUTORIAL_KEY, 'true');
      onDismiss();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-2xl p-6">
      <div
        className="w-full max-w-sm apple-glass rounded-3xl p-7 flex flex-col items-center gap-5 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        key={step}
      >
        <div className="w-16 h-16 rounded-2xl apple-glass-card flex items-center justify-center text-4xl shadow-inner">
          {current.emoji}
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
            {current.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {current.desc}
          </p>
        </div>

        {current.showZones && (
          <div className="flex gap-2 w-full mt-1">
            {['← Left', '↑ Center', '→ Right'].map((label) => (
              <div
                key={label}
                className="flex-1 py-2 rounded-xl apple-glass-card border-primary/30 text-primary font-semibold text-xs text-center"
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Apple Step Indicator Dots */}
        <div className="flex items-center gap-1.5 mt-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-primary' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleNext}
          className="apple-pill-primary w-full py-3.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 mt-1"
        >
          <span>{isLast ? 'Begin Training' : 'Continue'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

export function shouldShowTutorial(): boolean {
  return !localStorage.getItem(TUTORIAL_KEY);
}
