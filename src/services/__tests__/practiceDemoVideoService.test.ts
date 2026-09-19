import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPracticeDemoVideoCache,
  listPracticeDemoVideos,
  sequenceKeyFromStorageName,
  titleFromStorageName,
} from '../practiceDemoVideoService';

vi.mock('../../firebase/config', () => ({
  storage: { _type: 'storage' },
}));

const { listAll, getDownloadURL, ref } = vi.hoisted(() => ({
  listAll: vi.fn(),
  getDownloadURL: vi.fn(),
  ref: vi.fn((_storage: unknown, path: string) => ({ fullPath: path, name: path })),
}));

vi.mock('firebase/storage', () => ({
  listAll,
  getDownloadURL,
  ref,
}));

describe('practiceDemoVideoService', () => {
  beforeEach(() => {
    clearPracticeDemoVideoCache();
    vi.clearAllMocks();
  });

  it('formats storage filenames into titles', () => {
    expect(titleFromStorageName('practice-rounds-demo.mp4')).toBe('Practice Rounds Demo');
    expect(titleFromStorageName('Listening Practice Round 1, Turn One..mp4')).toBe(
      'Listening Practice Round 1, Turn One'
    );
  });

  it('maps filenames onto the four-part sequence', () => {
    expect(sequenceKeyFromStorageName('SpeakerListenerScribeIntro.mp4')).toBe('intro');
    expect(sequenceKeyFromStorageName('Listening Practice Round 1, Turn One..mp4')).toBe(
      'round1Turn1'
    );
    expect(
      sequenceKeyFromStorageName('Listening Practice Round 1 Turns Two and Three.mp4')
    ).toBe('round1Complete');
    expect(sequenceKeyFromStorageName('Listening Practice Round 2.mp4')).toBe('round2');
  });

  it('lists videos in demonstration order', async () => {
    listAll.mockResolvedValue({
      items: [
        { fullPath: 'practiceVideos/Listening Practice Round 2.mp4', name: 'Listening Practice Round 2.mp4' },
        { fullPath: 'practiceVideos/SpeakerListenerScribeIntro.mp4', name: 'SpeakerListenerScribeIntro.mp4' },
        {
          fullPath: 'practiceVideos/Listening Practice Round 1, Turn One..mp4',
          name: 'Listening Practice Round 1, Turn One..mp4',
        },
        {
          fullPath: 'practiceVideos/Listening Practice Round 1 Turns Two and Three.mp4',
          name: 'Listening Practice Round 1 Turns Two and Three.mp4',
        },
      ],
      prefixes: [],
    });
    getDownloadURL.mockImplementation(async (item: { name: string }) => `https://cdn.example/${item.name}`);

    const videos = await listPracticeDemoVideos();

    expect(videos.map((v) => v.sequenceKey)).toEqual([
      'intro',
      'round1Turn1',
      'round1Complete',
      'round2',
    ]);
  });

  it('returns an empty list when Storage is unavailable', async () => {
    listAll.mockRejectedValue(new Error('permission-denied'));
    await expect(listPracticeDemoVideos()).resolves.toEqual([]);
  });
});
