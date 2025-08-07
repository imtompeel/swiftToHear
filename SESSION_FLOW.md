# Session Creation and Join Flow

This document describes the new multi-user session flow that resolves the conflict between session duration selection and role assignment.

## Overview

The new flow separates session creation (host-only) from session joining (participant-only), ensuring that session configuration is set before participants join.

## Flow Architecture

### 1. Session Creation (`/practice/create`)
- **Host only** - Duration, topic, and session name are configured
- **Components**: `SessionCreation`, `SessionCreationWrapper`
- **Features**:
  - Duration selection (5, 10, 15, 20 minutes or custom)
  - Topic input with sample suggestions
  - Session naming
  - Shareable link generation
  - Copy to clipboard functionality

### 2. Session Joining (`/practice/join/:sessionId`)
- **Participants only** - Read-only session info, role selection
- **Components**: `SessionJoin`, `SessionJoinWrapper`
- **Features**:
  - Display session details (duration, topic, host, creation time)
  - Show current participants and their roles
  - Role selection (listener, scribe, observer)
  - Real-time availability checking
  - Join session with validation

### 3. Session Lobby (`/practice/lobby/:sessionId`)
- **All participants** - Wait for session to start
- **Components**: `SessionLobby`, `SessionLobbyWrapper`
- **Features**:
  - Participant readiness status
  - Host controls (start session, share link)
  - Role-specific preparation tips
  - Session preview and guidelines
  - Leave session functionality

### 4. Main Session (`/practice?sessionId=...`)
- **All participants** - The actual dialectic session
- **Components**: `DialecticSession` (updated)
- **Features**:
  - Role-based interfaces
  - Adjustable session duration
  - Real-time collaboration

## Key Components

### SessionService
- **Location**: `src/services/sessionService.ts`
- **Purpose**: Session state management
- **Features**:
  - Create, join, and manage sessions
  - Participant management
  - Role availability checking
  - localStorage persistence
  - Ready state management

### useSession Hook
- **Location**: `src/hooks/useSession.ts`
- **Purpose**: React integration for session management
- **Features**:
  - Session state management
  - Navigation handling
  - Error handling
  - User management

### Wrapper Components
- **SessionCreationWrapper**: Integrates SessionCreation with session service
- **SessionJoinWrapper**: Integrates SessionJoin with session service
- **SessionLobbyWrapper**: Integrates SessionLobby with session service

## Data Flow

1. **Host creates session** → SessionService.createSession() → Navigate to lobby
2. **Participants join** → SessionService.joinSession() → Navigate to lobby
3. **Lobby interactions** → SessionService.updateReadyState() → Real-time updates
4. **Host starts session** → SessionService.startSession() → Navigate to main session

## URL Structure

- `/practice/create` - Create new session
- `/practice/join/:sessionId` - Join existing session
- `/practice/lobby/:sessionId` - Session lobby
- `/practice?sessionId=...` - Main session (existing)

## Session Data Structure

```typescript
interface SessionData {
  sessionId: string;
  sessionName: string;
  duration: number; // milliseconds
  topic: string;
  hostId: string;
  hostName: string;
  createdAt: Date;
  participants: Participant[];
  status: 'waiting' | 'active' | 'completed';
  minParticipants: number;
  maxParticipants: number;
}

interface Participant {
  id: string;
  name: string;
  role: string; // 'host' | 'listener' | 'scribe' | 'observer'
  status: 'ready' | 'not-ready' | 'connecting';
  connectionStatus?: 'good' | 'poor' | 'disconnected';
}
```

## Benefits

1. **Resolves multi-user conflict**: Duration is set before participants join
2. **Clear separation of concerns**: Creation vs. joining vs. participation
3. **Scalable architecture**: Ready for real-time collaboration features
4. **Better UX**: Participants see session details before joining
5. **Role management**: Automatic role availability checking
6. **Session persistence**: localStorage-based session storage

## Future Enhancements

1. **Real-time updates**: WebSocket integration for live participant updates
2. **Database integration**: Replace localStorage with proper backend
3. **Session templates**: Pre-configured session types
4. **Advanced role management**: Multiple participants per role
5. **Session recording**: Save and replay sessions
6. **Analytics**: Session participation metrics

## Testing

- **Component tests**: Individual component functionality
- **Service tests**: SessionService business logic
- **Integration tests**: Full flow testing
- **E2E tests**: Complete user journey testing

## Usage Example

```typescript
// Create a session
const session = await SessionService.createSession({
  sessionName: 'Deep Listening Practice',
  duration: 15 * 60 * 1000, // 15 minutes
  topic: 'What transitions are we navigating?',
  hostId: 'user-123',
  hostName: 'Alice',
  minParticipants: 2,
  maxParticipants: 4
});

// Join a session
const updatedSession = await SessionService.joinSession({
  sessionId: session.sessionId,
  userId: 'user-456',
  userName: 'Bob',
  role: 'listener'
});
``` 