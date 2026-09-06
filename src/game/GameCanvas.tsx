import { useRef, useEffect } from 'react';
import { Direction } from './types';

interface GameCanvasProps {
  ballDirection: Direction;
  diveDirection: Direction | null;
  ballProgress: number;
  diveProgress: number;
  saved: boolean | null;
  width: number;
  height: number;
  gloveColor?: string;
}

export function GameCanvas({
  ballDirection, diveDirection, ballProgress, diveProgress, saved, width, height, gloveColor = '#ffcc00',
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const w = width;
    const h = height;
    ctx.clearRect(0, 0, w, h);

    // Draw pitch
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#0a2e1a');
    gradient.addColorStop(0.4, '#0d3d22');
    gradient.addColorStop(1, '#1a5c35');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Pitch lines
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    // Center circle
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.85, w * 0.15, 0, Math.PI * 2);
    ctx.stroke();

    // Goal
    const goalW = w * 0.7;
    const goalH = h * 0.35;
    const goalX = (w - goalW) / 2;
    const goalY = h * 0.08;

    // Goal shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(goalX - 4, goalY - 4, goalW + 8, goalH + 8);

    // Goal net pattern
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(goalX, goalY, goalW, goalH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = goalX; i < goalX + goalW; i += 15) {
      ctx.beginPath();
      ctx.moveTo(i, goalY);
      ctx.lineTo(i, goalY + goalH);
      ctx.stroke();
    }
    for (let j = goalY; j < goalY + goalH; j += 15) {
      ctx.beginPath();
      ctx.moveTo(goalX, j);
      ctx.lineTo(goalX + goalW, j);
      ctx.stroke();
    }

    // Goal posts
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 5;
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(goalX, goalY + goalH);
    ctx.lineTo(goalX, goalY);
    ctx.lineTo(goalX + goalW, goalY);
    ctx.lineTo(goalX + goalW, goalY + goalH);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Crossbar bottom line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(goalX, goalY + goalH);
    ctx.lineTo(goalX + goalW, goalY + goalH);
    ctx.stroke();

    // Goalkeeper
    const gkBaseX = w / 2;
    const gkBaseY = goalY + goalH * 0.55;
    let gkOffsetX = 0;
    let gkOffsetY = 0;

    if (diveDirection && diveProgress > 0) {
      const eased = 1 - Math.pow(1 - diveProgress, 3);
      if (diveDirection === 'left') {
        gkOffsetX = -goalW * 0.35 * eased;
        gkOffsetY = goalH * 0.15 * eased;
      } else if (diveDirection === 'right') {
        gkOffsetX = goalW * 0.35 * eased;
        gkOffsetY = goalH * 0.15 * eased;
      } else {
        gkOffsetY = -goalH * 0.1 * eased;
      }
    }

    const gkX = gkBaseX + gkOffsetX;
    const gkY = gkBaseY + gkOffsetY;
    const gkSize = w * 0.045;

    // GK body
    ctx.fillStyle = gloveColor;
    ctx.shadowColor = gloveColor;
    ctx.shadowBlur = 15;

    // Head
    ctx.beginPath();
    ctx.arc(gkX, gkY - gkSize * 1.8, gkSize * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillRect(gkX - gkSize * 0.4, gkY - gkSize * 1.2, gkSize * 0.8, gkSize * 1.5);

    // Arms
    ctx.lineWidth = gkSize * 0.3;
    ctx.strokeStyle = gloveColor;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (diveDirection === 'left' && diveProgress > 0.2) {
      ctx.moveTo(gkX, gkY - gkSize);
      ctx.lineTo(gkX - gkSize * 2.5, gkY - gkSize * 2);
    } else if (diveDirection === 'right' && diveProgress > 0.2) {
      ctx.moveTo(gkX, gkY - gkSize);
      ctx.lineTo(gkX + gkSize * 2.5, gkY - gkSize * 2);
    } else {
      // Arms up
      ctx.moveTo(gkX - gkSize * 1.5, gkY - gkSize * 1.8);
      ctx.lineTo(gkX, gkY - gkSize);
      ctx.lineTo(gkX + gkSize * 1.5, gkY - gkSize * 1.8);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineCap = 'butt';

    // Ball
    if (ballProgress > 0) {
      const startX = w / 2;
      const startY = h * 0.95;
      let targetX = w / 2;
      const targetY = goalY + goalH * 0.4;

      if (ballDirection === 'left') targetX = goalX + goalW * 0.2;
      else if (ballDirection === 'right') targetX = goalX + goalW * 0.8;

      const eased = 1 - Math.pow(1 - ballProgress, 2);
      const bx = startX + (targetX - startX) * eased;
      const by = startY + (targetY - startY) * eased;
      const ballSize = w * 0.03 * (1 - eased * 0.3);

      // Ball shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(bx + 3, by + 3, ballSize, ballSize * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ball
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255,255,255,0.6)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(bx, by, ballSize, 0, Math.PI * 2);
      ctx.fill();

      // Ball pattern
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx, by, ballSize * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Result flash
    if (saved !== null && ballProgress >= 1) {
      ctx.fillStyle = saved
        ? 'rgba(34, 197, 94, 0.15)'
        : 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `bold ${w * 0.12}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = saved ? '#22c55e' : '#ef4444';
      ctx.shadowColor = saved ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)';
      ctx.shadowBlur = 30;
      ctx.fillText(saved ? 'SAVED!' : 'GOAL!', w / 2, h * 0.55);
      ctx.shadowBlur = 0;
    }
  }, [ballDirection, diveDirection, ballProgress, diveProgress, saved, width, height, gloveColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
