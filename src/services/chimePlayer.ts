export const TIMER_MUTE_STORAGE_KEY = 'timerMuted';

const SAMPLE_URL = '/48325__monkay__singingbowl.wav';
const COALESCE_MS = 280;
const SAMPLE_VOLUME = 0.6;
const SYNTH_VOLUME = 0.28;

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

type StoppableSource = { stop: (when?: number) => void };

let audioContext: AudioContext | null = null;
let sampleBuffer: AudioBuffer | null = null;
let sampleLoadState: 'idle' | 'loading' | 'ready' | 'missing' = 'idle';
let lastPlayAt = 0;
let chimesArmed = false;
const activeSources = new Set<StoppableSource>();

function getAudioContextConstructor(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const withWebkit = window as WindowWithWebkitAudio;
  return window.AudioContext || withWebkit.webkitAudioContext;
}

function getAudioContext(): AudioContext | null {
  const Ctor = getAudioContextConstructor();
  if (!Ctor) {
    return null;
  }
  if (!audioContext) {
    try {
      audioContext = new Ctor();
    } catch {
      return null;
    }
  }
  return audioContext;
}

async function resumeContext(ctx: AudioContext): Promise<void> {
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // Autoplay policies can reject until a later gesture.
    }
  }
}

async function loadSample(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (sampleLoadState === 'ready') {
    return sampleBuffer;
  }
  if (sampleLoadState === 'missing' || sampleLoadState === 'loading') {
    return sampleBuffer;
  }
  if (typeof fetch !== 'function') {
    sampleLoadState = 'missing';
    return null;
  }

  sampleLoadState = 'loading';
  try {
    const response = await fetch(SAMPLE_URL);
    if (!response.ok) {
      sampleLoadState = 'missing';
      return null;
    }
    const data = await response.arrayBuffer();
    sampleBuffer = await ctx.decodeAudioData(data.slice(0));
    sampleLoadState = 'ready';
    return sampleBuffer;
  } catch {
    sampleLoadState = 'missing';
    sampleBuffer = null;
    return null;
  }
}

function trackSource(source: StoppableSource): void {
  activeSources.add(source);
}

function forgetSource(source: StoppableSource): void {
  activeSources.delete(source);
}

function playSample(ctx: AudioContext, buffer: AudioBuffer): void {
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.value = SAMPLE_VOLUME;
  source.connect(gain);
  gain.connect(ctx.destination);
  trackSource(source);
  source.onended = () => forgetSource(source);
  source.start();
}

/** Inharmonic decaying partials — used when the bowl sample is missing. */
function playSynthesisedBowl(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const partials = [
    { frequency: 220, gain: 0.55, duration: 2.4 },
    { frequency: 328.5, gain: 0.28, duration: 2.1 },
    { frequency: 441, gain: 0.22, duration: 1.8 },
    { frequency: 662, gain: 0.12, duration: 1.4 },
    { frequency: 880, gain: 0.08, duration: 1.1 },
  ];

  for (const partial of partials) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(partial.frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      SYNTH_VOLUME * partial.gain,
      now + 0.018
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + partial.duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    trackSource(oscillator);
    oscillator.onended = () => forgetSource(oscillator);
    oscillator.start(now);
    oscillator.stop(now + partial.duration + 0.05);
  }
}

export function getTimerMuted(): boolean {
  try {
    return localStorage.getItem(TIMER_MUTE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setTimerMuted(muted: boolean): void {
  try {
    localStorage.setItem(TIMER_MUTE_STORAGE_KEY, String(muted));
  } catch {
    // Private mode / quota — mute still applies in memory via the caller.
  }
}

export function armTimerChimes(): void {
  chimesArmed = true;
}

export function stopTimerChimes(): void {
  chimesArmed = false;
  lastPlayAt = 0;
  for (const source of activeSources) {
    try {
      source.stop();
    } catch {
      // Already stopped.
    }
  }
  activeSources.clear();
}

export function unlockTimerChime(): void {
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }
  void resumeContext(ctx);
  void loadSample(ctx);
}

export async function playTimerChime(): Promise<boolean> {
  if (!chimesArmed) {
    return false;
  }

  const now = Date.now();
  if (now - lastPlayAt < COALESCE_MS) {
    return false;
  }
  lastPlayAt = now;

  const ctx = getAudioContext();
  if (!ctx) {
    return false;
  }

  await resumeContext(ctx);
  if (ctx.state === 'suspended') {
    return false;
  }

  const buffer = await loadSample(ctx);
  try {
    if (buffer) {
      playSample(ctx, buffer);
    } else {
      playSynthesisedBowl(ctx);
    }
    return true;
  } catch {
    return false;
  }
}

/** Test helper — not used in production. */
export function resetChimePlayerForTests(): void {
  stopTimerChimes();
  sampleBuffer = null;
  sampleLoadState = 'idle';
  if (audioContext) {
    void audioContext.close().catch(() => undefined);
  }
  audioContext = null;
}
