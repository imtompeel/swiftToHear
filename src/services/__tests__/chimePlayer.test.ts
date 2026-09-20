import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function createMockAudioContext() {
  const destination = {};
  const createGain = () => {
    const node = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    return node;
  };
  const createOscillator = vi.fn(() => ({
    type: 'sine',
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  const createBufferSource = vi.fn(() => ({
    buffer: null as AudioBuffer | null,
    connect: vi.fn(),
    start: vi.fn(),
  }));

  return {
    state: 'running' as AudioContextState,
    currentTime: 0,
    destination,
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    decodeAudioData: vi.fn().mockRejectedValue(new Error('no sample')),
    createGain,
    createOscillator,
    createBufferSource,
  };
}

describe('chimePlayer', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('AudioContext', vi.fn(() => createMockAudioContext()));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('falls back to a synthesised bowl when the sample is missing', async () => {
    const { playTimerChime, armTimerChimes, resetChimePlayerForTests } = await import('../chimePlayer');
    armTimerChimes();
    const played = await playTimerChime();
    expect(played).toBe(true);

    const ctx = (AudioContext as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(ctx.createOscillator).toHaveBeenCalled();
    resetChimePlayerForTests();
  });

  it('stays silent until the speaking round arms the player', async () => {
    const { playTimerChime, armTimerChimes, resetChimePlayerForTests } = await import('../chimePlayer');
    await expect(playTimerChime()).resolves.toBe(false);
    armTimerChimes();
    await expect(playTimerChime()).resolves.toBe(true);
    resetChimePlayerForTests();
  });

  it('coalesces duplicate plays from stacked timers', async () => {
    const { playTimerChime, armTimerChimes, resetChimePlayerForTests } = await import('../chimePlayer');
    armTimerChimes();
    await expect(playTimerChime()).resolves.toBe(true);
    await expect(playTimerChime()).resolves.toBe(false);
    resetChimePlayerForTests();
  });

  it('persists mute preference', async () => {
    localStorage.clear();
    const { getTimerMuted, setTimerMuted } = await import('../chimePlayer');
    expect(getTimerMuted()).toBe(false);
    setTimerMuted(true);
    expect(getTimerMuted()).toBe(true);
    localStorage.clear();
  });
});
