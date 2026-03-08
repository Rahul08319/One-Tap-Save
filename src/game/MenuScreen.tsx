interface MenuScreenProps {
  onStart: () => void;
}

export function MenuScreen({ onStart }: MenuScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/95">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
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
          onClick={onStart}
          className="mt-4 px-10 py-4 bg-primary text-primary-foreground font-display text-2xl tracking-wider rounded-lg box-glow-primary active:scale-95 transition-transform"
        >
          PLAY
        </button>
      </div>
    </div>
  );
}
