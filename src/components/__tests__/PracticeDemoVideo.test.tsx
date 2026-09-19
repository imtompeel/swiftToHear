import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PracticeDemoVideo } from '../PracticeDemoVideo';

const listPracticeDemoVideos = vi.fn();

vi.mock('../../services/practiceDemoVideoService', () => ({
  listPracticeDemoVideos: (...args: unknown[]) => listPracticeDemoVideos(...args),
}));

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('PracticeDemoVideo', () => {
  beforeEach(() => {
    listPracticeDemoVideos.mockReset();
  });

  it('renders nothing when there are no videos', async () => {
    listPracticeDemoVideos.mockResolvedValue([]);
    const { container } = render(<PracticeDemoVideo />);
    await waitFor(() => {
      expect(listPracticeDemoVideos).toHaveBeenCalled();
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a player when videos are available', async () => {
    listPracticeDemoVideos.mockResolvedValue([
      {
        id: 'practiceVideos/demo.mp4',
        path: 'practiceVideos/demo.mp4',
        title: 'Demo',
        url: 'https://cdn.example/demo.mp4',
      },
    ]);

    render(<PracticeDemoVideo />);

    expect(await screen.findByTestId('practice-demo-video-player')).toBeInTheDocument();
    expect(screen.getByText('practiceDemo.title')).toBeInTheDocument();
  });

  it('starts collapsed in collapsible variant', async () => {
    listPracticeDemoVideos.mockResolvedValue([
      {
        id: 'practiceVideos/demo.mp4',
        path: 'practiceVideos/demo.mp4',
        title: 'Demo',
        url: 'https://cdn.example/demo.mp4',
      },
    ]);

    render(<PracticeDemoVideo variant="collapsible" />);

    const toggle = await screen.findByTestId('practice-demo-video-toggle');
    expect(screen.queryByTestId('practice-demo-video-player')).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(await screen.findByTestId('practice-demo-video-player')).toBeInTheDocument();
  });
});
