import { vi } from 'vitest';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import {
  render,
  screen,
  describe,
  it,
  setupTests,
} from './setup';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

describe('App Routing for Session Management', () => {
  setupTests();

  it('should render the landing page at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should render DialecticSession at /practice', () => {
    render(
      <MemoryRouter initialEntries={['/practice']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('dialectic-session')).toBeInTheDocument();
  });

  it('should render matchmaking flow at /practice/match', () => {
    render(
      <MemoryRouter initialEntries={['/practice/match']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('match-flow')).toBeInTheDocument();
  });

  it('should render session creation at /practice/create', () => {
    render(
      <MemoryRouter initialEntries={['/practice/create']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('step-by-step-session-creation')).toBeInTheDocument();
  });
});
