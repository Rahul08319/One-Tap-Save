// Web Audio API sound effects - no external files needed
const audioCtx = () => {
  if (!(window as any).__gameAudioCtx) {
    (window as any).__gameAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return (window as any).__gameAudioCtx as AudioContext;
};

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.15) {
  try {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playNoise(duration: number, volume = 0.1) {
  try {
    const ctx = audioCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch {}
}

export function playKickSound() {
  playNoise(0.15, 0.2);
  playTone(150, 0.1, 'sine', 0.2);
}

export function playSaveSound() {
  playTone(523, 0.1, 'square', 0.12);
  setTimeout(() => playTone(659, 0.1, 'square', 0.12), 80);
  setTimeout(() => playTone(784, 0.15, 'square', 0.12), 160);
}

export function playGoalSound() {
  playTone(330, 0.3, 'sawtooth', 0.1);
  setTimeout(() => playTone(220, 0.4, 'sawtooth', 0.1), 200);
}

export function playStreakSound() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, 'sine', 0.1), i * 100);
  });
}

export function playMenuSelectSound() {
  playTone(440, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(660, 0.1, 'sine', 0.1), 60);
}
