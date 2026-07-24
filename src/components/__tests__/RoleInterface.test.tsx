import {
  render,
  screen,
  describe,
  it,
  expect,
  setupTests,
  SpeakerInterface,
  ListenerInterface,
  ScribeInterface,
  PassiveObserverInterface,
  mockTopics,
  defaultRoleInterfaceProps,
} from './setup';

describe('Role-Specific Interfaces', () => {
  setupTests();

  describe('SpeakerInterface', () => {
    it('should render the speaker interface with the session topic', () => {
      const props = defaultRoleInterfaceProps({
        topic: mockTopics.personalGrowth.customPrompt,
      });

      render(<SpeakerInterface {...props} />);

      expect(screen.getByTestId('speaker-interface')).toBeInTheDocument();
      expect(screen.getByText(mockTopics.personalGrowth.customPrompt)).toBeInTheDocument();
    });

    it('should show the shared speaker role label', () => {
      render(<SpeakerInterface {...defaultRoleInterfaceProps()} />);
      expect(screen.getByText('shared.roles.speaker')).toBeInTheDocument();
    });
  });

  describe('ListenerInterface', () => {
    it('should render the listener interface', () => {
      render(<ListenerInterface {...defaultRoleInterfaceProps()} />);
      expect(screen.getByTestId('listener-interface')).toBeInTheDocument();
      expect(screen.getByText('shared.roles.listener')).toBeInTheDocument();
    });
  });

  describe('ScribeInterface', () => {
    it('should render the scribe interface', () => {
      render(<ScribeInterface {...defaultRoleInterfaceProps()} />);
      expect(screen.getByTestId('scribe-interface')).toBeInTheDocument();
      expect(screen.getByText('shared.roles.scribe')).toBeInTheDocument();
    });
  });

  describe('PassiveObserverInterface', () => {
    it('should render the observer interface with round information', () => {
      render(
        <PassiveObserverInterface
          {...defaultRoleInterfaceProps({ currentRound: 2 })}
        />
      );

      expect(screen.getByTestId('passive-observer-interface')).toBeInTheDocument();
      expect(screen.getByText('Round 2')).toBeInTheDocument();
      expect(screen.getByText('shared.roles.observer')).toBeInTheDocument();
    });
  });
});
