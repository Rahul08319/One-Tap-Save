// Web Audio API sound effects - no external files needed
let gameAudioEnabled = true;
let gamePaused = false;

export function setGameAudioEnabled(enabled: boolean) {
  gameAudioEnabled = enabled;
  const ctx = (window as any).__gameAudioCtx as AudioContext | undefined;
  if (!ctx) return;
  if (enabled && ctx.state === 'suspended') void ctx.resume();
  if (!enabled && ctx.state === 'running') void ctx.suspend();
}

export function isAudioMuted(): boolean {
  return !gameAudioEnabled;
}

export function isGameAudioEnabled(): boolean {
  return gameAudioEnabled;
}

export function setGamePaused(paused: boolean) {
  gamePaused = paused;
  const ctx = (window as any).__gameAudioCtx as AudioContext | undefined;
  if (!ctx) return;
  if (paused && ctx.state === 'running') void ctx.suspend();
  if (!paused && gameAudioEnabled && ctx.state === 'suspended') void ctx.resume();
}

const audioCtx = () => {
  if (!(window as any).__gameAudioCtx) {
    (window as any).__gameAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return (window as any).__gameAudioCtx as AudioContext;
};

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.15) {
  if (!gameAudioEnabled || gamePaused) return;
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
  if (!gameAudioEnabled || gamePaused) return;
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

export function playComboSound(multiplier: number) {
  const baseFreq = 600 + multiplier * 100;
  playTone(baseFreq, 0.12, 'sine', 0.12);
  setTimeout(() => playTone(baseFreq * 1.25, 0.12, 'sine', 0.12), 70);
}

// Crowd ambient sound
let crowdNode: AudioBufferSourceNode | null = null;
let crowdGain: GainNode | null = null;

export function startCrowdAmbience() {
  if (!gameAudioEnabled || gamePaused) return;
  try {
    const ctx = audioCtx();
    
    // Create a looping noise buffer for crowd ambience
    const duration = 3;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        // Mix of filtered noise to simulate crowd murmur
        const t = i / ctx.sampleRate;
        const wave = Math.sin(t * 80) * 0.3 + Math.sin(t * 120 + ch) * 0.2;
        const noise = (Math.random() * 2 - 1) * 0.5;
        // Slow modulation for natural feel
        const mod = 0.7 + 0.3 * Math.sin(t * 0.5 + ch * 0.3);
        data[i] = (noise * 0.4 + wave * 0.1) * mod;
      }
    }
    
    crowdNode = ctx.createBufferSource();
    crowdNode.buffer = buffer;
    crowdNode.loop = true;
    
    crowdGain = ctx.createGain();
    crowdGain.gain.setValueAtTime(0, ctx.currentTime);
    crowdGain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 1);
    
    // Low-pass filter for muffled crowd effect
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    
    crowdNode.connect(filter);
    filter.connect(crowdGain);
    crowdGain.connect(ctx.destination);
    crowdNode.start();
  } catch {}
}

export function crowdCheer() {
  if (crowdGain) {
    try {
      const ctx = audioCtx();
      crowdGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.2);
      crowdGain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 1.5);
    } catch {}
  }
}

export function crowdGroan() {
  if (crowdGain) {
    try {
      const ctx = audioCtx();
      crowdGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
      crowdGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 2);
    } catch {}
  }
}

export function stopCrowdAmbience() {
  try {
    if (crowdNode) {
      crowdNode.stop();
      crowdNode = null;
    }
    crowdGain = null;
  } catch {}
}
