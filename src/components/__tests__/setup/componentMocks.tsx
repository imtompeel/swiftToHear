import React from 'react';

// ===== IMPORT ACTUAL COMPONENTS =====
import { SpeakerInterface as ActualSpeakerInterface } from '../../SpeakerInterface';
import { ListenerInterface as ActualListenerInterface } from '../../ListenerInterface';
import { ScribeInterface as ActualScribeInterface } from '../../ScribeInterface';
import { PassiveObserverInterface as ActualPassiveObserverInterface } from '../../PassiveObserverInterface';
import { DialecticSession as ActualDialecticSession } from '../../DialecticSession';

// ===== EXPORT ACTUAL COMPONENTS =====
// Now using real components instead of mocks

export const SpeakerInterface = ActualSpeakerInterface;
export const ListenerInterface = ActualListenerInterface;
export const ScribeInterface = ActualScribeInterface;
export const PassiveObserverInterface = ActualPassiveObserverInterface;
export const DialecticSession = ActualDialecticSession;

// ===== MOCK NEW COMPONENTS (until they're implemented) =====

export const SessionCreation: React.FC<any> = (props) => {
  const { onSessionCreate } = props;
  
  return (
    <div data-testid="session-creation-component">
      <div data-testid="session-creation-form">
        <h1>dialectic.creation.title</h1>
        <p>dialectic.creation.description</p>
        
        {/* Duration Selection */}
        <div data-testid="duration-selector">
          <label>dialectic.creation.duration.label</label>
          <p>dialectic.creation.duration.description</p>
          <p>dialectic.creation.duration.help</p>
          
          <button data-testid="duration-option-5" className="border-secondary-200">
            5 dialectic.creation.duration.minute
          </button>
          <button data-testid="duration-option-10" className="border-secondary-200">
            10 dialectic.creation.duration.minute
          </button>
          <button data-testid="duration-option-15" className="border-accent-500">
            15 dialectic.creation.duration.minute
          </button>
          <button data-testid="duration-option-20" className="border-secondary-200">
            20 dialectic.creation.duration.minute
          </button>
          
          <input 
            data-testid="custom-duration-input" 
            placeholder="dialectic.creation.duration.customPlaceholder"
          />
          <div role="alert">dialectic.creation.duration.minError</div>
          <div role="alert">dialectic.creation.duration.maxError</div>
        </div>
        
        {/* Topic Selection */}
        <div data-testid="topic-selection-section">
          <label>dialectic.creation.topic.label</label>
          <p>dialectic.creation.topic.help</p>
          <input data-testid="custom-topic-input" />
          <p>dialectic.creation.topic.suggestions</p>
          <button data-testid="sample-topic-1">What is alive in you right now?</button>
          <button data-testid="sample-topic-2">What challenge are you facing?</button>
          <button data-testid="sample-topic-3">What transition are you navigating?</button>
        </div>
        
        {/* Session Name */}
        <div>
          <label>dialectic.creation.sessionName.label</label>
          <p>dialectic.creation.sessionName.help</p>
          <input 
            data-testid="session-name-input" 
            defaultValue="Dialectic Session - 15 Jan 2024"
          />
          <div>dialectic.creation.sessionName.required</div>
        </div>
        
        {/* Preview */}
        <div data-testid="session-preview">
          <h3>dialectic.creation.preview.title</h3>
          <p>15 minutes</p>
          <p>dialectic.creation.preview.participants</p>
        </div>
        
        {/* Create Button */}
        <button 
          data-testid="create-session-button"
          onClick={() => {
            const sessionData = {
              sessionId: 'test-session-id-123',
              sessionName: 'Test Session',
              duration: 15 * 60 * 1000,
              topic: '',
              hostId: 'host-id',
              createdAt: new Date(),
              participants: [],
              status: 'waiting'
            };
            onSessionCreate?.(sessionData);
          }}
        >
          dialectic.creation.create
        </button>
        <div>dialectic.creation.creating</div>
        
        {/* Share Link */}
        <div data-testid="session-link">
          practice/join/test-session-id-123
        </div>
        <button data-testid="copy-link-button">dialectic.creation.shareLink.copy</button>
      </div>
      
      {/* Participant Info */}
      <div data-testid="participant-info">3-4 participants</div>
      
      {/* Mobile Layout */}
      <div data-testid="mobile-optimized-layout" style={{ display: 'none' }}>Mobile Layout</div>
    </div>
  );
};

export const SessionJoin: React.FC<any> = (props) => {
  const { session, onJoinSession, onRoleSelect, currentUserId } = props;
  
  if (!session) {
    return (
      <div data-testid="session-not-found">
        <p>dialectic.join.sessionNotFound</p>
        <button data-testid="back-to-creation">dialectic.join.backToCreate</button>
      </div>
    );
  }
  
  return (
    <div data-testid="session-join-component">
      <h1>dialectic.join.title</h1>
      
      {/* Session Info */}
      <div data-testid="session-info-display">
        <h2>{session.sessionName}</h2>
        <div data-testid="session-duration-display">{session.duration / 60000} minutes</div>
        <div data-testid="session-topic-display">
          {session.topic || <span>dialectic.join.noTopicSet</span>}
        </div>
        <div data-testid="host-info">Hosted by {session.hostName}</div>
        <div data-testid="session-created-time">Created at</div>
      </div>
      
      {/* Current Participants */}
      <div data-testid="current-participants">
        <h3>dialectic.join.currentParticipants</h3>
        <div data-testid="participant-count">{session.participants.length} of 4 participants</div>
        {session.participants.map((p: any) => (
          <div key={p.id}>
            {p.name} ({p.role === 'host' ? 'Host' : p.role})
            <div data-testid={`participant-status-${p.status}`}></div>
          </div>
        ))}
      </div>
      
      {/* Role Selection */}
      <div data-testid="role-selection-section">
        <h3>dialectic.join.chooseRole</h3>
        {session.availableRoles?.includes('listener') && (
          <button 
            data-testid="role-listener" 
            onClick={() => onRoleSelect?.('listener')}
            className="border-secondary-200"
          >
            dialectic.roles.listener.title
            <p>dialectic.roles.listener.description</p>
          </button>
        )}
        {session.availableRoles?.includes('scribe') && (
          <button 
            data-testid="role-scribe"
            onClick={() => onRoleSelect?.('scribe')}
            className="border-secondary-200"
          >
            dialectic.roles.scribe.title
            <p>dialectic.roles.scribe.description</p>
          </button>
        )}
        {session.availableRoles?.includes('observer') && (
          <button 
            data-testid="role-observer"
            onClick={() => onRoleSelect?.('observer')}
            className="border-secondary-200"
          >
            shared.roles.observer
            <p>dialectic.roles.observer.description</p>
          </button>
        )}
        {session.availableRoles?.length === 1 && session.availableRoles[0] === 'observer' && (
          <p>dialectic.join.onlyObserverAvailable</p>
        )}
        {session.availableRoles?.length === 0 && (
          <div data-testid="session-full-message">dialectic.join.sessionFull</div>
        )}
      </div>
      
      {/* Session Status */}
      <div data-testid={`session-status-${session.status}`}>
        {session.status === 'waiting' && <p>dialectic.join.waitingToStart</p>}
        {session.status === 'active' && <p>dialectic.join.sessionInProgress</p>}
      </div>
      
      {/* Join Button */}
      <button 
        data-testid="join-session-button"
        disabled={true}
        onClick={() => {
          onJoinSession?.({
            sessionId: session.sessionId,
            userId: currentUserId,
            userName: props.currentUserName,
            role: 'listener'
          });
        }}
      >
        dialectic.join.joinSession
      </button>
      <div>dialectic.join.joining</div>
      <div data-testid="join-error">dialectic.join.error</div>
      
      {/* Additional Elements */}
      <div data-testid="session-id-display">{session.sessionId}</div>
      <div data-testid="first-time-guidance">dialectic.join.firstTimeWelcome</div>
      <div data-testid="role-guidance">dialectic.join.roleGuidance</div>
      <div data-testid="estimated-start-time">Estimated start time</div>
      <div data-testid="mobile-optimized-layout" style={{ display: 'none' }}>Mobile Layout</div>
      <div data-testid="user-identification" style={{ display: 'none' }}>
        <input data-testid="name-input" />
      </div>
      <div role="status">dialectic.join.sessionStarted</div>
    </div>
  );
};

export const SessionLobby: React.FC<any> = (props) => {
  const { session, isHost, onStartSession, onLeaveSession, onUpdateReadyState } = props;
  
  return (
    <div data-testid="session-lobby-component">
      <h1>dialectic.lobby.title</h1>
      
      {/* Session Info */}
      <div data-testid="session-lobby-info">
        <h2>{session.sessionName}</h2>
        <p>{session.duration / 60000} minutes</p>
        <p>{session.topic}</p>
      </div>
      
      {/* Countdown and Status */}
      <div data-testid="session-countdown">Ready to begin</div>
      <div data-testid="participants-readiness">{session.participants.length} participants ready</div>
      
      {/* Participant List */}
      <div data-testid="participant-list" aria-label="dialectic.lobby.participantList">
        {session.participants.map((p: any) => (
          <div key={p.id}>
            <span>{p.name}</span>
            <span>({p.role === 'host' ? 'Host' : p.role})</span>
            <div data-testid={`participant-${p.status}-${p.id}`}></div>
            {p.connectionStatus && (
              <div data-testid={`connection-status-${p.connectionStatus}`}></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Waiting Messages */}
      {session.participants.length < 3 && (
        <div data-testid="waiting-for-participants">
          <p>dialectic.lobby.waitingForParticipants</p>
          <p>{session.participants.length} of 3 participants joined</p>
        </div>
      )}
      
      {/* Ready State */}
      <div data-testid="ready-state-toggle">
        <button onClick={() => onUpdateReadyState?.(props.currentUserId, true)}>
          dialectic.lobby.markAsReady
        </button>
      </div>
      <div data-testid="your-ready-status">You are ready</div>
      
      {/* Host Controls */}
      {isHost && (
        <div data-testid="host-controls">
          <button 
            data-testid="start-session-button"
            onClick={() => {
              // Show confirmation dialog
              const dialog = document.createElement('div');
              dialog.setAttribute('data-testid', 'start-confirmation-dialog');
              dialog.innerHTML = `
                <p>dialectic.lobby.confirmStart</p>
                <button data-testid="confirm-start-button">Confirm</button>
              `;
              document.body.appendChild(dialog);
              
              const confirmButton = dialog.querySelector('[data-testid="confirm-start-button"]');
              confirmButton?.addEventListener('click', () => {
                onStartSession?.(session.sessionId);
                document.body.removeChild(dialog);
              });
            }}
          >
            dialectic.lobby.startSession
          </button>
          <p>dialectic.lobby.waitingForAllReady</p>
        </div>
      )}
      
      {/* Preparation Tips */}
      <div data-testid="role-preparation-tips">dialectic.lobby.speakerTips</div>
      <div data-testid="tech-check-option">dialectic.lobby.testAudioVideo</div>
      <div data-testid="session-preview">
        <h3>dialectic.lobby.sessionPreview.title</h3>
        <p>{session.duration / 60000} minutes total</p>
        <p>3 rounds of 5 minutes each</p>
      </div>
      <div data-testid="session-guidelines">dialectic.lobby.guidelines</div>
      <div data-testid="contextual-help">dialectic.lobby.firstTimeHere</div>
      
      {/* Sharing */}
      {isHost && (
        <div>
          <div data-testid="share-session-link">Invite more participants</div>
          <button data-testid="copy-session-link">dialectic.lobby.copyLink</button>
          <div data-testid="session-qr-code">QR Code</div>
        </div>
      )}
      
      {/* Duration Breakdown */}
      <div data-testid="duration-breakdown">5 minutes per round</div>
      
      {/* Leave Session */}
      <button 
        data-testid="leave-session-button"
        onClick={() => {
          if (isHost) {
            const dialog = document.createElement('div');
            dialog.setAttribute('data-testid', 'host-leave-confirmation');
            dialog.innerHTML = '<p>dialectic.lobby.hostLeaveWarning</p>';
            document.body.appendChild(dialog);
          }
          onLeaveSession?.(props.currentUserId);
        }}
      >
        dialectic.lobby.leaveSession
      </button>
      
      {/* Mobile Layout */}
      <div data-testid="mobile-optimized-layout" style={{ display: 'none' }}>Mobile Layout</div>
      
      {/* Status announcements */}
      <div role="status">Participant status changed</div>
    </div>
  );
};