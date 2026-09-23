import { Direction, GameState } from './types';

interface DiveControlsProps {
  onDive: (dir: Direction) => void;
  gameState: GameState;
  leftHanded?: boolean;
}

export function DiveControls({ onDive, gameState, leftHanded = false }: DiveControlsProps) {
  const isActive = gameState === 'shooting';

  return (
    <div className={`absolute bottom-0 ${leftHanded ? 'left-0 right-[20%]' : 'left-0 right-0'} flex h-[35%] z-20 select-none`}>
      <button
        className=\"flex-1 flex items-center justify-center transition-all duration-100 active:scale-95 active:bg-white/10 group focus:outline-none\"
        onPointerDown={(e) => {
          e.preventDefault();
          if (isActive) onDive('left');
        }}
        aria-label=\"Dive Left\"
      >
        <div className=\"flex flex-col items-center opacity-45 group-hover:opacity-70 group-active:opacity-100 group-active:scale-110 transition-all duration-100\">
          <div className=\"w-12 h-12 rounded-full apple-glass-card flex items-center justify-center\">
            <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2.5\" className=\"text-foreground\">
              <path d=\"M15 18l-6-6 6-6\" />
            </svg>
          </div>
          <span className=\"text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-1.5\">
            Left
          </span>
        </div>
      </button>

      <button
        className=\"flex-1 flex items-center justify-center transition-all duration-100 active:scale-95 active:bg-white/10 group focus:outline-none\"
        onPointerDown={(e) => {
          e.preventDefault();
          if (isActive) onDive('center');
        }}
        aria-label=\"Dive Center\"
      >
        <div className=\"flex flex-col items-center opacity-45 group-hover:opacity-70 group-active:opacity-100 group-active:scale-110 transition-all duration-100\">
          <div className=\"w-12 h-12 rounded-full apple-glass-card flex items-center justify-center\">
            <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2.5\" className=\"text-foreground\">
              <path d=\"M12 19V5M5 12l7-7 7 7\" />
            </svg>
          </div>
          <span className=\"text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-1.5\">
            Center
          </span>
        </div>
      </button>

      <button
        className=\"flex-1 flex items-center justify-center transition-all duration-100 active:scale-95 active:bg-white/10 group focus:outline-none\"
        onPointerDown={(e) => {
          e.preventDefault();
          if (isActive) onDive('right');
        }}
        aria-label=\"Dive Right\"
      >
        <div className=\"flex flex-col items-center opacity-45 group-hover:opacity-70 group-active:opacity-100 group-active:scale-110 transition-all duration-100\">
          <div className=\"w-12 h-12 rounded-full apple-glass-card flex items-center justify-center\">
            <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2.5\" className=\"text-foreground\">
              <path d=\"M9 18l6-6-6-6\" />
            </svg>
          </div>
          <span className=\"text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-1.5\">
            Right
          </span>
        </div>
      </button>
    </div>
  );
}
