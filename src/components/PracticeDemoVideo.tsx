import React, { useEffect, useId, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import {
  listPracticeDemoVideos,
  type PracticeDemoSequenceKey,
  type PracticeDemoVideoItem,
} from '../services/practiceDemoVideoService';

export type PracticeDemoVideoVariant = 'panel' | 'collapsible';

interface PracticeDemoVideoProps {
  /** panel: always visible player; collapsible: starts as a text link */
  variant?: PracticeDemoVideoVariant;
  /** tighter spacing for waiting room / lobby */
  density?: 'default' | 'compact';
  className?: string;
}

function labelForVideo(
  video: PracticeDemoVideoItem,
  t: (key: string) => string
): string {
  if (video.sequenceKey === 'other') return video.title;
  return t(`practiceDemo.parts.${video.sequenceKey}`);
}

/**
 * Loads and plays practice/rounds demo videos from Firebase Storage `practiceVideos/`.
 * Renders nothing if the folder is empty or inaccessible.
 */
export const PracticeDemoVideo: React.FC<PracticeDemoVideoProps> = ({
  variant = 'panel',
  density = 'default',
  className = '',
}) => {
  const { t } = useTranslation();
  const listId = useId();
  const [videos, setVideos] = useState<PracticeDemoVideoItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty'>('loading');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(variant === 'panel');

  useEffect(() => {
    let cancelled = false;
    listPracticeDemoVideos().then((items) => {
      if (cancelled) return;
      if (items.length === 0) {
        setStatus('empty');
        return;
      }
      setVideos(items);
      setActiveId(items[0].id);
      setStatus('ready');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'empty') return null;

  const activeIndex = videos.findIndex((v) => v.id === activeId);
  const active = activeIndex >= 0 ? videos[activeIndex] : videos[0];
  const compact = density === 'compact';
  const shellClass =
    variant === 'collapsible' && !expanded
      ? 'text-center'
      : compact
        ? 'surface-panel p-4'
        : 'rounded-2xl border border-accent-200 dark:border-accent-700 bg-accent-50/80 dark:bg-accent-950/30 p-5 sm:p-6';

  const playNext = () => {
    if (activeIndex < 0 || activeIndex >= videos.length - 1) return;
    setActiveId(videos[activeIndex + 1].id);
  };

  return (
    <section
      className={`${shellClass} ${className}`.trim()}
      data-testid="practice-demo-video"
      aria-busy={status === 'loading'}
    >
      {variant === 'collapsible' && !expanded ? (
        <button
          type="button"
          data-testid="practice-demo-video-toggle"
          onClick={() => setExpanded(true)}
          className="text-sm font-semibold text-accent-700 dark:text-accent-300 underline underline-offset-2 hover:text-accent-800 dark:hover:text-accent-200"
        >
          {t('practiceDemo.watchLink')}
        </button>
      ) : (
        <>
          <div className={compact ? 'mb-3' : 'mb-4'}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  className={
                    compact
                      ? 'font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-1'
                      : 'font-display text-xl font-semibold text-secondary-900 dark:text-secondary-50 mb-1'
                  }
                >
                  {t('practiceDemo.title')}
                </h3>
                <p
                  className={
                    compact
                      ? 'text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed'
                      : 'text-sm sm:text-base text-secondary-600 dark:text-secondary-400 leading-relaxed'
                  }
                >
                  {t('practiceDemo.description')}
                </p>
              </div>
              {variant === 'collapsible' && (
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="shrink-0 text-sm text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
                  data-testid="practice-demo-video-collapse"
                >
                  {t('shared.actions.close')}
                </button>
              )}
            </div>
          </div>

          {status === 'loading' && (
            <p
              className="text-sm text-secondary-500 dark:text-secondary-400"
              data-testid="practice-demo-video-loading"
            >
              {t('practiceDemo.loading')}
            </p>
          )}

          {status === 'ready' && active && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl bg-secondary-950 aspect-video">
                <video
                  key={active.id}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full"
                  data-testid="practice-demo-video-player"
                  aria-label={labelForVideo(active, t)}
                  onEnded={playNext}
                >
                  <source src={active.url} />
                  {t('practiceDemo.unsupported')}
                </video>
              </div>

              <p
                className="text-xs text-secondary-500 dark:text-secondary-400"
                data-testid="practice-demo-video-step"
              >
                {t('practiceDemo.stepLabel', {
                  current: String(activeIndex + 1),
                  total: String(videos.length),
                  title: labelForVideo(active, t),
                })}
              </p>

              {videos.length > 1 && (
                <div>
                  <p className="sr-only" id={listId}>
                    {t('practiceDemo.playlistLabel')}
                  </p>
                  <ol
                    className="flex flex-wrap gap-2"
                    aria-labelledby={listId}
                    data-testid="practice-demo-video-playlist"
                  >
                    {videos.map((video, index) => {
                      const selected = video.id === active.id;
                      const key = video.sequenceKey as PracticeDemoSequenceKey;
                      return (
                        <li key={video.id}>
                          <button
                            type="button"
                            onClick={() => setActiveId(video.id)}
                            aria-pressed={selected}
                            className={
                              selected
                                ? 'rounded-lg bg-accent-600 text-white px-3 py-1.5 text-sm font-medium'
                                : 'rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white/70 dark:bg-secondary-900/60 text-secondary-800 dark:text-secondary-200 px-3 py-1.5 text-sm hover:border-accent-400'
                            }
                            data-testid={`practice-demo-video-item-${index}`}
                            data-sequence-key={key}
                          >
                            <span className="opacity-70 mr-1">{index + 1}.</span>
                            {labelForVideo(video, t)}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default PracticeDemoVideo;
