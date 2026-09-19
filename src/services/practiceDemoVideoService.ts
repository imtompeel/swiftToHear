import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { storage } from '../firebase/config';

/** Ordered parts of the practice demonstration. */
export type PracticeDemoSequenceKey =
  | 'intro'
  | 'round1Turn1'
  | 'round1Complete'
  | 'round2'
  | 'other';

export interface PracticeDemoVideoItem {
  id: string;
  path: string;
  /** Fallback title from the file name */
  title: string;
  /** Stable sequence key used for ordering + i18n labels */
  sequenceKey: PracticeDemoSequenceKey;
  order: number;
  url: string;
}

const PRACTICE_VIDEOS_FOLDER = 'practiceVideos';
const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v)$/i;

const SEQUENCE_ORDER: Record<PracticeDemoSequenceKey, number> = {
  intro: 0,
  round1Turn1: 1,
  round1Complete: 2,
  round2: 3,
  other: 100,
};

let cachedVideos: PracticeDemoVideoItem[] | null = null;
let inflight: Promise<PracticeDemoVideoItem[]> | null = null;

/** Turn a storage object name into a short human title. */
export function titleFromStorageName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').replace(/\.+$/, '');
  const spaced = base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!spaced) return name;
  return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Map a storage file name onto the intended demo sequence.
 * Tolerant of wording differences while the remaining files finish uploading.
 */
export function sequenceKeyFromStorageName(name: string): PracticeDemoSequenceKey {
  const normalised = name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[._]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (/intro|speaker\s*listener\s*scribe/.test(normalised)) {
    return 'intro';
  }

  if (/round\s*2/.test(normalised)) {
    return 'round2';
  }

  if (/round\s*1/.test(normalised)) {
    // First turn of round 1
    if (/turn\s*(one|1)\b/.test(normalised) && !/turn\s*(two|2|three|3)/.test(normalised)) {
      return 'round1Turn1';
    }
    // Remaining turns that complete round 1
    return 'round1Complete';
  }

  return 'other';
}

/**
 * Lists demo videos from Firebase Storage `practiceVideos/`.
 * Results are ordered: intro → round 1 turn 1 → round 1 complete → round 2.
 */
export async function listPracticeDemoVideos(): Promise<PracticeDemoVideoItem[]> {
  if (cachedVideos) return cachedVideos;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const folderRef = ref(storage, PRACTICE_VIDEOS_FOLDER);
      const listing = await listAll(folderRef);
      const videoRefs = listing.items.filter((item) => VIDEO_EXTENSION.test(item.name));

      const videos = await Promise.all(
        videoRefs.map(async (item) => {
          const url = await getDownloadURL(item);
          const sequenceKey = sequenceKeyFromStorageName(item.name);
          return {
            id: item.fullPath,
            path: item.fullPath,
            title: titleFromStorageName(item.name),
            sequenceKey,
            order: SEQUENCE_ORDER[sequenceKey],
            url,
          } satisfies PracticeDemoVideoItem;
        })
      );

      videos.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      });

      cachedVideos = videos;
      return videos;
    } catch (error) {
      console.warn('Unable to load practice demo videos from Storage', error);
      // Do not cache failures — uploads/rules may still be settling
      return [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Test helper — clears the in-memory cache. */
export function clearPracticeDemoVideoCache(): void {
  cachedVideos = null;
  inflight = null;
}
