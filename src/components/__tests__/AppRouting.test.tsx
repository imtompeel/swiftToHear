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

  it('should render the audience gateway at /', () => {
    render(
      <MemoryRouter initialEntries={['/?choose=1']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('audience-gateway')).toBeInTheDocument();
  });

  it('should render the open landing at /welcome', () => {
    render(
      <MemoryRouter initialEntries={['/welcome']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('landing-open')).toBeInTheDocument();
  });

  it('should render DialecticSession at /practice', async () => {
    render(
      <MemoryRouter initialEntries={['/practice']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('dialectic-session')).toBeInTheDocument();
  });

  it('should render matchmaking flow at /practice/match', async () => {
    localStorage.setItem('swiftToHear.audience', 'open');

    render(
      <MemoryRouter initialEntries={['/practice/match']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('match-flow')).toBeInTheDocument();
  });

  it('should render session creation at /practice/create', async () => {
    render(
      <MemoryRouter initialEntries={['/practice/create']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('step-by-step-session-creation')).toBeInTheDocument();
  });
});
