import { useState, useEffect } from 'react';

const TUTORIAL_KEY = 'otg_tutorial_seen';

interface TutorialOverlayProps {
  onDismiss: () => void;
}

export function TutorialOverlay({ onDismiss }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      emoji: '⚽',
      title: 'THE BALL IS COMING!',
      desc: 'A shot will fly toward your goal. Watch which direction it goes!',
    },
    {
      emoji: '🧤',
      title: 'TAP TO DIVE',
      desc: 'Tap LEFT, CENTER, or RIGHT to dive and block the shot.',
      showZones: true,
    },
    {
      emoji: '🔥',
      title: 'BUILD COMBOS',
      desc: 'Save in the same direction consecutively for bonus multiplier points!',
    },
    {
      emoji: '💀',
      title: '3 GOALS = GAME OVER',
      desc: 'Concede 3 goals and it\'s over. How many can you save?',
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(TUTORIAL_KEY, 'true');
      onDismiss();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/97" onClick={handleNext}>
      <div className="flex flex-col items-center gap-4 max-w-[280px] text-center animate-fade-in" key={step}>
        <div className="text-6xl">{current.emoji}</div>
        <h2 className="font-display text-3xl text-primary text-glow-primary tracking-wider">{current.title}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{current.desc}</p>

        {current.showZones && (
          <div className="flex gap-3 mt-2">
            {['← LEFT', '↑ CENTER', '→ RIGHT'].map(label => (
              <div key={label} className="px-3 py-2 rounded-lg border border-primary/30 text-primary font-display text-sm tracking-wider">
                {label}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <span className="text-muted-foreground text-xs mt-2">
          {isLast ? 'TAP TO START' : 'TAP TO CONTINUE'}
        </span>
      </div>
    </div>
  );
}

export function shouldShowTutorial(): boolean {
  return !localStorage.getItem(TUTORIAL_KEY);
}
