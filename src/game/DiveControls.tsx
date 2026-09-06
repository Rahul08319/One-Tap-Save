import { Direction, GameState } from './types';

interface DiveControlsProps {
  onDive: (dir: Direction) => void;
  gameState: GameState;
  leftHanded?: boolean;
}

export function DiveControls({ onDive, gameState, leftHanded = false }: DiveControlsProps) {
  const isActive = gameState === 'shooting';

  return (
    <div className={`absolute bottom-0 ${leftHanded ? 'left-0 right-[20%]' : 'left-0 right-0'} flex h-[35%] z-20`}>
      <button
        className="flex-1 flex items-center justify-center active:bg-primary/10 transition-colors"
        onPointerDown={() => isActive && onDive('left')}
        aria-label="Dive Left"
      >
        <div className="flex flex-col items-center opacity-40">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Left</span>
        </div>
      </button>
      <button
        className="flex-1 flex items-center justify-center active:bg-primary/10 transition-colors"
        onPointerDown={() => isActive && onDive('center')}
        aria-label="Dive Center"
      >
        <div className="flex flex-col items-center opacity-40">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Center</span>
        </div>
      </button>
      <button
        className="flex-1 flex items-center justify-center active:bg-primary/10 transition-colors"
        onPointerDown={() => isActive && onDive('right')}
        aria-label="Dive Right"
      >
        <div className="flex flex-col items-center opacity-40">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Right</span>
        </div>
      </button>
    </div>
  );
}
