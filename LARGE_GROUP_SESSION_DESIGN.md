# Large Group Session Design

## Overview

This document outlines the UX design and technical implementation strategy for handling large groups (5-20+ people) by automatically breaking them into smaller groups of 3-4 participants, while maintaining the core dialectic experience.

## Current System Analysis

### Existing Architecture
- **Single Session Model**: Designed for 3-4 participants per session
- **Role-based Rotation**: Speaker → Listener → Scribe → Observer
- **Host Control**: Host manages session flow and phase transitions
- **Real-time Collaboration**: WebRTC video calling with Firebase signaling
- **Session Phases**: hello-checkin → listening → transition (scribe feedback) → reflection

### Current Limitations
- Maximum 4 participants per session
- No group management capabilities
- Single session focus
- No scaling mechanism for larger workshops

## UX Design Strategy

### 1. Session Creation Phase - Enhanced Options

```
┌─────────────────────────────────────────────────────────┐
│                    Session Creation                     │
├─────────────────────────────────────────────────────────┤
│ Session Name: [Large Group Workshop]                    │
│ Duration: [30 minutes]                                  │
│ Topic: [What challenges are you facing?]               │
│                                                         │
│ ┌─────────────────┐  ┌─────────────────┐               │
│ │ Single Session  │  │ Group Sessions  │ ← NEW OPTION  │
│ │ (3-4 people)    │  │ (5-20+ people)  │               │
│ └─────────────────┘  └─────────────────┘               │
│                                                         │
│ Group Configuration:                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Group Size: [3] [4] [Mixed]                        │ │
│ │ Auto-assign Roles: [Yes] [No]                      │ │
│ │ Group Rotation: [Random] [Balanced] [Manual]       │ │
│ │ Observer Strategy: [Distribute] [Central]          │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2. Enhanced Lobby Experience

```
┌─────────────────────────────────────────────────────────┐
│                    Session Lobby                        │
├─────────────────────────────────────────────────────────┤
│ Participants: 12/15 ready                               │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Group Assignment Preview                            │ │
│ │                                                     │ │
│ │ Group A (4 people): Alice, Bob, Charlie, Diana     │ │
│ │ Group B (4 people): Eve, Frank, Grace, Henry       │ │
│ │ Group C (4 people): Iris, Jack, Kate, Liam         │ │
│ │                                                     │ │
│ │ [Shuffle Groups] [Manual Override] [Auto-assign]   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Start All Groups] [Start Individual Groups]           │
└─────────────────────────────────────────────────────────┘
```

### 3. Group Management Dashboard

```
┌─────────────────────────────────────────────────────────┐
│                Group Management Dashboard               │
├─────────────────────────────────────────────────────────┤
│ Session: "Large Group Workshop"                        │
│ Topic: "What challenges are you facing?"              │
│ Duration: 30 minutes                                   │
│                                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │   Group A   │ │   Group B   │ │   Group C   │        │
│ │ 4/4 Ready   │ │ 3/4 Ready   │ │ 4/4 Ready   │        │
│ │ [Start]     │ │ [Start]     │ │ [Start]     │        │
│ │ [Monitor]   │ │ [Monitor]   │ │ [Monitor]   │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                         │
│ [Start All Groups] [Pause All] [End All]               │
└─────────────────────────────────────────────────────────┘
```

### 4. Individual Group Sessions

```
┌─────────────────────────────────────────────────────────┐
│                    Group A Session                     │
├─────────────────────────────────────────────────────────┤
│ Phase: Listening | Round: 1/3 | Time: 8:45             │
│                                                         │
│ ┌─────────────────┐ ┌─────────────────┐               │
│ │    Speaker      │ │    Listener     │               │
│ │    Alice        │ │     Bob         │               │
│ │  [Speaking...]  │ │  [Listening]    │               │
│ └─────────────────┘ └─────────────────┘               │
│                                                         │
│ ┌─────────────────┐ ┌─────────────────┐               │
│ │     Scribe      │ │    Observer     │               │
│ │    Charlie      │ │     Diana       │ │
│ │ [Taking notes]  │ │   [Observing]   │               │
│ └─────────────────┘ └─────────────────┘               │
│                                                         │
│ [Complete Round] [Pause Group] [End Group]             │
└─────────────────────────────────────────────────────────┘
```

## Key UX Principles

### 1. Progressive Disclosure
- **Simple Start**: Default to single session mode
- **Advanced Options**: Group mode available but not overwhelming
- **Clear Benefits**: Show advantages of group mode (better engagement, diverse perspectives)

### 2. Visual Group Management
- **Group Preview**: Show how participants will be grouped before starting
- **Real-time Status**: Live updates on each group's progress
- **Easy Override**: Allow manual adjustments to auto-generated groups

### 3. Flexible Control
- **Host Control**: Host can start groups individually or all at once
- **Group Monitoring**: Host can monitor all groups from central dashboard
- **Intervention Tools**: Ability to pause, end, or merge groups

### 4. Seamless Transitions
- **Smooth Grouping**: Automatic assignment with manual override options
- **Role Distribution**: Intelligent role assignment across groups
- **Session Continuity**: Groups can continue independently or be merged

## Technical Implementation Strategy

### 1. Enhanced Data Models

```typescript
interface GroupSessionData extends SessionData {
  groupMode: 'single' | 'multi';
  groups: GroupData[];
  groupConfiguration: {
    groupSize: 3 | 4 | 'mixed';
    autoAssignRoles: boolean;
    groupRotation: 'random' | 'balanced' | 'manual';
    observerStrategy: 'distribute' | 'central';
  };
}

interface GroupData {
  groupId: string;
  participants: Participant[];
  status: 'waiting' | 'active' | 'paused' | 'completed';
  currentPhase: string;
  roundNumber: number;
  startTime?: Timestamp;
  scribeNotes?: Record<number, string>;
}

interface GroupConfiguration {
  groupSize: 3 | 4 | 'mixed';
  autoAssignRoles: boolean;
  groupRotation: 'random' | 'balanced' | 'manual';
  observerStrategy: 'distribute' | 'central';
  maxGroups?: number;
}
```

### 2. Group Assignment Algorithm

```typescript
class GroupAssignmentService {
  static assignGroups(
    participants: Participant[], 
    config: GroupConfiguration
  ): GroupData[] {
    // Intelligent grouping based on:
    // - Optimal group sizes (3-4 people)
    // - Role distribution
    // - Participant readiness
    // - Host preferences
    // - Observer strategy
  }

  static distributeObservers(
    participants: Participant[], 
    groups: GroupData[], 
    strategy: 'distribute' | 'central'
  ): GroupData[] {
    // Handle observer distribution across groups
  }

  static balanceRoles(groups: GroupData[]): GroupData[] {
    // Ensure each group has balanced role distribution
  }
}
```

### 3. Centralized Management

```typescript
class GroupSessionManager {
  static async startAllGroups(sessionId: string): Promise<void>;
  static async startGroup(groupId: string): Promise<void>;
  static async pauseGroup(groupId: string): Promise<void>;
  static async mergeGroups(groupIds: string[]): Promise<void>;
  static async monitorGroups(sessionId: string): Observable<GroupStatus[]>;
  static async getGroupProgress(sessionId: string): Promise<GroupProgress[]>;
}

interface GroupStatus {
  groupId: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  currentPhase: string;
  roundNumber: number;
  participants: Participant[];
  timeRemaining?: number;
}

interface GroupProgress {
  groupId: string;
  completedRounds: number;
  totalRounds: number;
  averageSpeakingTime: number;
  participationRate: number;
}
```

### 4. Enhanced Session Service

```typescript
class FirestoreGroupSessionService extends FirestoreSessionService {
  static async createGroupSession(
    sessionData: Omit<GroupSessionData, 'sessionId' | 'createdAt' | 'groups'>
  ): Promise<GroupSessionData>;

  static async assignParticipantsToGroups(
    sessionId: string, 
    config: GroupConfiguration
  ): Promise<GroupData[]>;

  static async startGroupSession(sessionId: string): Promise<GroupSessionData>;

  static async updateGroupPhase(
    sessionId: string, 
    groupId: string, 
    phase: string
  ): Promise<GroupData>;

  static async completeGroupRound(
    sessionId: string, 
    groupId: string
  ): Promise<GroupData>;
}
```

## User Journey Flow

### 1. Host Creates Session
- Chooses between single session or group mode
- Configures group settings (size, role assignment, etc.)
- Sets session parameters (duration, topic, etc.)

### 2. Participants Join
- See group assignment preview
- Can view which group they'll be in
- Prepare for their assigned role

### 3. Host Reviews Groups
- Reviews auto-generated group assignments
- Can shuffle participants or manually adjust groups
- Confirms group configuration

### 4. Session Starts
- Groups begin simultaneously or individually
- Each group operates independently
- Host can monitor all groups from central dashboard

### 5. Host Monitors
- Central dashboard shows all group progress
- Real-time status updates for each group
- Ability to intervene if needed

### 6. Groups Complete
- Individual group sessions complete
- Option to merge groups for final reflection
- Consolidated feedback and insights

## Implementation Phases

### Phase 1: Foundation ✅
- [x] Extend data models for group sessions (`src/types/groupSession.ts`)
- [x] Create group assignment service (`src/services/groupAssignmentService.ts`)
- [x] Update session creation UI (`src/components/SessionCreation.tsx`)
- [x] Implement basic group management

### Phase 2: Core Functionality ✅
- [x] Group session lobby (`src/components/GroupSessionLobby.tsx`)
- [x] Basic monitoring dashboard (`src/components/GroupManagementDashboard.tsx`)
- [x] Role assignment across groups (in `GroupAssignmentService`)
- [x] Group session service (`src/services/firestoreGroupSessionService.ts`)
- [x] Individual group sessions (`src/components/GroupSession.tsx`)

### Phase 3: Advanced Features
- [ ] Group merging capabilities
- [ ] Advanced monitoring and analytics
- [ ] Group-specific settings
- [ ] Performance optimizations

### Phase 4: Polish & Scale
- [ ] UI/UX refinements
- [ ] Performance testing with large groups
- [ ] Advanced group management features
- [ ] Analytics and reporting

## Benefits

### For Participants
- **Better Engagement**: Smaller groups allow for more meaningful participation
- **Diverse Perspectives**: Multiple groups provide varied viewpoints
- **Focused Attention**: Smaller groups reduce cognitive load
- **Role Clarity**: Clear role assignments in each group

### For Hosts
- **Scalable Management**: Handle large groups efficiently
- **Flexible Control**: Start, pause, and manage groups individually
- **Real-time Monitoring**: Track progress across all groups
- **Intervention Capability**: Address issues in specific groups

### For the Platform
- **Scalability**: Support for larger workshops and events
- **Flexibility**: Adapt to different group sizes and configurations
- **Analytics**: Rich data on group dynamics and participation
- **Growth**: Enable larger-scale adoption and use cases

## Considerations

### Technical Challenges
- **WebRTC Scaling**: Managing multiple video connections
- **Firebase Limits**: Handling increased Firestore operations
- **Performance**: Real-time updates across multiple groups
- **Synchronization**: Coordinating group phases and timing

### UX Challenges
- **Complexity Management**: Keeping the interface intuitive
- **Group Awareness**: Helping participants understand their group context
- **Host Workload**: Managing multiple groups without overwhelming the host
- **Error Handling**: Graceful degradation when groups have issues

### Future Enhancements
- **AI-Powered Grouping**: Intelligent participant matching
- **Dynamic Grouping**: Real-time group adjustments
- **Cross-Group Activities**: Activities that span multiple groups
- **Advanced Analytics**: Detailed insights into group dynamics
