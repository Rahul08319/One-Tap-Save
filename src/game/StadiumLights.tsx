import { useEffect, useState } from 'react';

export function StadiumLights() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Top light beams */}
      {[0.15, 0.35, 0.65, 0.85].map((pos, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: `${pos * 100}%`,
            width: '2px',
            height: '30%',
            background: `linear-gradient(to bottom, hsl(var(--primary) / ${0.15 + Math.sin((tick + i) * 1.2) * 0.1}), transparent)`,
            filter: 'blur(8px)',
            transform: `scaleX(${8 + Math.sin((tick + i * 2) * 0.8) * 3})`,
            transition: 'all 2s ease',
          }}
        />
      ))}

      {/* Corner floodlights */}
      <div
        className="absolute top-0 left-0 w-32 h-32"
        style={{
          background: `radial-gradient(ellipse at top left, hsl(var(--secondary) / ${0.04 + Math.sin(tick * 0.7) * 0.02}), transparent 70%)`,
          transition: 'all 2s ease',
        }}
      />
      <div
        className="absolute top-0 right-0 w-32 h-32"
        style={{
          background: `radial-gradient(ellipse at top right, hsl(var(--secondary) / ${0.04 + Math.cos(tick * 0.7) * 0.02}), transparent 70%)`,
          transition: 'all 2s ease',
        }}
      />

      {/* Subtle ambient sweep */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${50 + Math.sin(tick * 0.5) * 20}% 20%, hsl(var(--primary) / 0.03), transparent 60%)`,
          transition: 'all 3s ease',
        }}
      />
    </div>
  );
}
