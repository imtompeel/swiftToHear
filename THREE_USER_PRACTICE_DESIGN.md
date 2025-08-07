# Dialectic Session Platform: Design Documentation

## Overview

An innovative platform feature that guides participants through dialectic listening practice via video call. The system supports both intimate 3-4 person sessions and larger groups with intelligent breakout room management. Each participant receives role-specific prompts, reassurances, and UI elements tailored to their current role (Speaker, Listener, Scribe, or Passive Observer), creating a balanced experience of assistance without distraction.

## Core Innovation

**What makes this unique:** No existing platform combines exactly three participants with complementary roles, real-time video with role-specific UI guidance, and live reassurance during natural conversation pauses.

## Design Principles

### Balance of Assistance vs. Distraction
- **Contextual Prompts**: Show guidance only when relevant to current phase
- **Minimal Interruption**: Visual cues over audio interruptions
- **Progressive Disclosure**: More guidance early, less as users gain confidence
- **Respectful Timing**: Prompts appear during natural pauses, not mid-sentence

## Session Architecture

**Standard 3-Person Configuration:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│   SPEAKER       │    LISTENER     │    SCRIBE       │
│   Screen        │    Screen       │    Screen       │
├─────────────────┼─────────────────┼─────────────────┤
│ • Current topic │ • Reflection    │ • Capture area  │
│ • Time guidance │   prompts       │ • Key insights  │
│ • Pause comfort │ • Listen cues   │ • Summary tools │
│ • Video feeds   │ • Video feeds   │ • Video feeds   │
└─────────────────┴─────────────────┴─────────────────┘
```

**Extended 4-Person Configuration:**
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   SPEAKER       │    LISTENER     │    SCRIBE       │ PASSIVE OBSERVER│
│   Screen        │    Screen       │    Screen       │    Screen       │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ • Current topic │ • Reflection    │ • Capture area  │ • Video grid    │
│ • Time guidance │   prompts       │ • Key insights  │ • Role tracking │
│ • Pause comfort │ • Listen cues   │ • Summary tools │ • Learning cues │
│ • Video feeds   │ • Video feeds   │ • Video feeds   │ • Personal notes│
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## Large Group Management

### Multi-Group Sessions (6+ participants)

When multiple people join a session, the platform provides structured group formation:

**Lobby Phase (3-5 minutes):**
- **Welcome Circle**: Brief introductions in main room
- **Intention Setting**: Shared moment of purpose alignment
- **Group Formation**: Intelligent matching based on preferences
- **Role Preferences**: Users indicate preferred roles or passive observation

**Breakout Groups:**
- **Primary Configuration**: Groups of 3 (Speaker, Listener, Scribe)
- **Alternative Configuration**: Groups of 4 (Speaker, Listener, Scribe, Passive Observer)
- **Flexible Assignment**: Users can choose active participation or observation

**Passive Observer Role:**
- **Silent Participation**: Observe without speaking or note-taking
- **Learning Focus**: Concentration on group dynamics and process
- **Minimal Interface**: Simple view with video feeds and role rotation tracking
- **Optional Engagement**: Can request to become active in later rounds

### Group Formation Algorithm

**Matching Considerations:**
- Role preferences and experience levels
- Topic interests and alignment
- Previous session compatibility
- Timezone and cultural considerations

**Group Composition:**
```
Ideal Group (3): Speaker + Listener + Scribe
Extended Group (4): Speaker + Listener + Scribe + Observer
```

**Rebalancing:**
- Automatic adjustment if participants leave
- Optional regrouping between rounds
- Facilitator tools for manual group adjustments

### Large Session Flow

**Phase 1: Community Gathering (5-8 minutes)**
- Main room welcome and introductions
- Shared intention or theme introduction
- Group formation and assignment
- Technical setup verification

**Phase 2: Breakout Practice (20-25 minutes)**
- Simultaneous small group sessions
- Coordinated role rotations across all groups
- Automated timing and prompts
- Optional inter-group check-ins

**Phase 3: Community Harvest (5-10 minutes)**
- Return to main room
- Shared insights and discoveries
- Cross-group learning exchange
- Future session coordination

## Session Flow

### 1. Pre-Session (5-8 minutes)
- **Role Assignment**: Automatic or user preference (including passive observer option)
- **Topic Selection**: Guided choice from curated important themes
- **Individual Orientation**: 60-second role-specific video
- **Practice Moment**: Quick 30-second role exercise
- **Connection Check**: Video/audio quality verification

### 2. Main Practice (18-32 minutes)

**Role Rotation Logic:**

**3-Person Sessions (18-24 minutes):**
- **Round 1**: Speaker, Listener, Scribe (6-8 minutes)
- **Round 2**: Listener, Scribe, Speaker (6-8 minutes)  
- **Round 3**: Scribe, Speaker, Listener (6-8 minutes)
- **Total**: 3 rounds, everyone experiences each active role

**4-Person Sessions with Passive Observer (18-24 minutes):**
- **Round 1**: Speaker, Listener, Scribe, Observer (6-8 minutes)
- **Round 2**: Listener, Scribe, Speaker, Observer (6-8 minutes)
- **Round 3**: Scribe, Speaker, Listener, Observer (6-8 minutes)
- **Total**: 3 rounds, 3 active participants rotate, 1 stays as passive observer

**4-Person Sessions with All Active (24-32 minutes):**
- **Round 1**: Speaker, Listener, Scribe, Observer (6-8 minutes)
- **Round 2**: Listener, Scribe, Observer, Speaker (6-8 minutes)
- **Round 3**: Scribe, Observer, Speaker, Listener (6-8 minutes)
- **Round 4**: Observer, Speaker, Listener, Scribe (6-8 minutes)
- **Total**: 4 rounds, everyone experiences each role including passive observation

**Role Assignment Rules:**
- **Passive Observer**: If designated as permanent passive, never rotates to active roles
- **Active Participants**: Rotate through Speaker → Listener → Scribe → (Observer if 4 active)
- **Round Count**: Equals number of active participants (3 or 4)
- **Session End**: When all participants have experienced all applicable roles

### 3. Reflection (3-5 minutes)
- **Shared Debrief**: What did we discover?
- **Personal Insights**: Individual reflection prompts
- **Next Steps**: Optional scheduling for another session

## Topic Selection Framework

### Curated Themes for Orientation

**Personal Growth & Relationships:**
- Current life transitions and changes
- Meaningful relationships and connections
- Personal challenges and growth edges
- Dreams, aspirations, and future visioning
- Values conflicts and alignment

**Work & Purpose:**
- Career direction and professional fulfilment
- Work-life balance and boundaries
- Creative projects and endeavours
- Leadership and collaboration challenges
- Finding meaning in daily work

**Well-being & Health:**
- Physical health and body awareness
- Mental health and emotional patterns
- Stress management and resilience
- Spiritual practices and beliefs
- Self-care and sustainability

**Community & Society:**
- Social justice and community involvement
- Environmental concerns and actions
- Cultural identity and belonging
- Generational differences and wisdom
- Local community engagement

**Learning & Development:**
- Skills development and learning goals
- Educational pursuits and knowledge
- Teaching and mentoring others
- Creative expression and arts
- Technology and digital life balance

### Topic Selection Process
1. **Browse Categories**: Users can explore themes that resonate
2. **Custom Topics**: Option to suggest personal topics of importance
3. **Group Consensus**: Brief discussion to align on shared interest
4. **Depth Guidance**: Prompts to help dive beneath surface topics

## Role-Specific Design

### SPEAKER Interface

**Primary Elements:**
- Large, clear topic/question display
- Gentle time indicator (not countdown pressure)
- Reassuring presence indicators

**Assistance Prompts:**
- "Take time to think" (appears after 10+ seconds silence)
- "Pauses are welcome" (appears during longer silences)
- "The listener is with you" (visual cue when listener is attentive)

**Visual Hierarchy:**
1. Current topic (largest)
2. Video feeds (medium)
3. Time guidance (subtle)
4. Comfort prompts (gentle)

### LISTENER Interface

**Primary Elements:**
- "Listen without preparing response" reminder
- Visual focus on speaker's video
- Reflection preparation area

**Assistance Prompts:**
- "What are you hearing?" (subtle reminder)
- "Notice your impulse to respond" (during speaker pauses)
- "Ready to reflect?" (when speaker concludes)

**Reflection Starters:**
- "What I heard was..."
- "What surprised me..."
- "What seemed important to you..."

### SCRIBE Interface

**Primary Elements:**
- Split screen: video + note area
- Key phrase capture tools
- Pattern recognition helpers

**Assistance Prompts:**
- "Capture key phrases, not everything"
- "Notice themes emerging"
- "What insights are surfacing?"

**Tools:**
- Quick phrase buttons
- Theme tagging
- Insight highlighting
- Summary generation

### PASSIVE OBSERVER Interface

**Primary Elements:**
- Clean video grid of active participants
- Minimal role rotation indicator
- Optional note-taking area (personal use only)

**Assistance Prompts:**
- "Notice the listening dynamics"
- "Observe how roles shape the conversation"
- "What patterns do you see emerging?"

**Learning Focus:**
- Understanding group facilitation
- Observing communication patterns
- Learning before active participation
- Cultural or accessibility accommodation

## Technical Considerations

### Real-Time Synchronisation
- **Session State**: All users see coordinated progression
- **Role Rotation**: Smooth transitions with brief pause
- **Prompt Timing**: Context-aware assistance delivery

### Minimal Distraction Technology
- **Silent Transitions**: Visual rather than audio cues
- **Adaptive Prompts**: Fewer prompts as session progresses
- **Intelligent Timing**: AI detection of natural conversation breaks

### WebRTC Architecture
- **Peer-to-Peer**: Direct video connections
- **Session Coordination**: Centralised state management
- **Quality Monitoring**: Automatic adjustment for connection issues

## Platform Architecture: Embedded Web Experience

### Core Philosophy: Zero Friction Access
**No downloads, no external accounts, no app switching** - users simply visit a website URL and immediately participate in guided practice sessions.

### Recommended Platform: Daily Prebuilt Integration

**Why Daily Prebuilt:**
- **Embedded directly** in website with 2 lines of code
- **No user accounts required** - instant access via URL
- **Professional video quality** with automatic bandwidth management
- **Built-in breakout room support** for large group → small group flow
- **Mobile optimised** - works seamlessly on phones/tablets
- **Cost effective** - 10,000 free minutes/month, then $0.002/minute
- **Enterprise features** available when needed

### Technical Architecture

**Website Structure:**
```
swiftToHear.com/practice/
├── 🎯 Topic Selection Interface
├── 👥 Role Preference Setting
├── 🎥 Embedded Video (Daily Prebuilt)
├── 📋 Role-Specific Guidance Panels
├── ⏱️ Session Timing & Transitions
└── 🌐 Community Features
```

**Implementation Flow:**
```javascript
// Embedded video with custom interface
const practiceSession = {
  // Daily Prebuilt embedded seamlessly
  videoFrame: DailyIframe.createFrame({
    iframeStyle: {
      width: '70%',
      height: '500px',
      borderRadius: '12px'
    }
  }),
  
  // Custom role management
  setupRoleInterface(role) {
    switch(role) {
      case 'speaker':
        showSpeakerPrompts();
        break;
      case 'listener':
        showReflectionStarters();
        break;
      case 'scribe':
        showCaptureInterface();
        break;
      case 'observer':
        showLearningFocus();
        break;
    }
  }
};
```

### User Experience Flow

**Seamless Web Journey:**
1. **Visit URL** → swiftToHear.com/practice
2. **Select topic** from curated themes
3. **Choose role preference** or passive observation
4. **Get matched** with others or join open session
5. **Video loads** directly in page (no external app)
6. **Guided practice** with role-specific interface
7. **Community debrief** integrated in same website

### Alternative Platform Options

**Backup Solutions Evaluated:**
- **VideoSDK**: More customisable, $0.003/minute, excellent for custom UI
- **Jitsi Meet**: Open source, completely free, self-hostable
- **Agora**: Most technically robust, higher cost, enterprise-focused

**Platform Comparison Matrix:**
| Platform | User Friction | Cost | Customisation | Reliability |
|----------|--------------|------|---------------|-------------|
| Daily Prebuilt | Lowest | Low | Medium | High |
| VideoSDK | Low | Low | High | High |
| Jitsi | Low | Free | High | Medium |
| Agora | Low | High | Highest | Highest |

### Integration with Current Codebase

**Compatibility with Existing React/TypeScript Setup:**
```typescript
// Integration with current swiftToHear components
interface PracticeSessionProps {
  topic: TopicTheme;
  participants: Participant[];
  sessionConfig: SessionConfiguration;
}

const PracticeSession: React.FC<PracticeSessionProps> = ({ 
  topic, 
  participants, 
  sessionConfig 
}) => {
  const [daily, setDaily] = useState<DailyCall | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('speaker');
  
  // Embed Daily Prebuilt with custom role interface
  return (
    <div className="practice-session">
      <TopicDisplay topic={topic} />
      <RoleGuidancePanel role={currentRole} />
      <DailyVideoFrame />
      <SessionControls />
    </div>
  );
};
```

## Success Metrics

### User Experience
- **Completion Rate**: Percentage finishing full session
- **Re-engagement**: Users booking follow-up sessions
- **Feedback Quality**: Post-session satisfaction scores

### Learning Effectiveness
- **Role Comprehension**: Understanding of each role's purpose
- **Practice Confidence**: Self-reported comfort with format
- **Community Building**: Connections formed between participants

## Future Enhancements

### Adaptive Learning
- **Personalised Prompts**: Based on individual learning patterns
- **Difficulty Progression**: More complex topics as users advance
- **Community Matching**: Connecting users with similar interests

### Integration Features
- **Calendar Sync**: Easy scheduling for groups
- **Progress Tracking**: Individual and group development
- **Community Features**: Finding practice partners

## Testing Strategy

### Phase 1: Platform Validation (Week 1-2)
**Daily Prebuilt Integration Testing:**
- **Basic Embedding**: Test Daily Prebuilt integration in local development
- **Multi-device Testing**: Verify functionality across desktop, mobile, tablet
- **Browser Compatibility**: Test Chrome, Safari, Firefox, Edge
- **Network Conditions**: Test on varying internet speeds and stability
- **User Journey**: Complete flow from URL visit to session completion

**Technical Validation:**
```bash
# Test implementations
npm install @daily-co/daily-js
# Create test rooms and embed in React components
# Verify role-based interface integration
# Test breakout room creation and management
```

### Phase 2: User Experience Testing (Week 3-4)
**Three-User Practice Sessions:**
- **Internal Testing**: Team members test all role combinations
- **Friend/Family Testing**: External users test with real conversations
- **Topic Validation**: Test curated themes for engagement and depth
- **Role Interface Testing**: Verify role-specific prompts are helpful
- **Transition Testing**: Smooth role rotations and session flow

**Metrics to Track:**
- Session completion rates
- User feedback on role clarity
- Technical issues encountered
- Time to join (friction measurement)
- Audio/video quality reports

### Phase 3: Community Testing (Week 5-6)
**Limited Beta Release:**
- **Small Group Launch**: 10-15 beta users
- **Real Community Sessions**: Authentic practice with strangers
- **Large Group Testing**: 6+ person sessions with breakouts
- **Scheduling Integration**: Test session coordination features
- **Feedback Collection**: Structured feedback on full experience

**Success Criteria:**
- 80%+ session completion rate
- Average session rating 4+ out of 5
- Less than 30 seconds from URL visit to video connection
- Zero critical technical failures
- Positive feedback on role-based guidance

### Phase 4: Iteration and Scaling (Week 7-8)
**Platform Optimisation:**
- **Performance Tuning**: Optimise video quality and loading times
- **UI Refinement**: Improve role interfaces based on user feedback
- **Feature Enhancement**: Add requested community features
- **Documentation**: Create user guides and onboarding materials
- **Analytics Integration**: Implement usage tracking and insights

### Alternative Platform Testing Plan

**Backup Platform Validation:**
If Daily Prebuilt issues arise, test alternatives in parallel:

1. **VideoSDK Backup** (2-3 days):
   - Test custom UI flexibility
   - Validate cost structure
   - Compare video quality

2. **Jitsi Fallback** (1-2 days):
   - Test open-source deployment
   - Evaluate self-hosting requirements
   - Assess feature limitations

**Testing Environments:**
- **Development**: Local testing with dummy data
- **Staging**: Full feature testing with test accounts
- **Production**: Live beta testing with real users

## Implementation Phases

### Phase 1: Core Embedded Platform (Weeks 1-4)
- **Daily Prebuilt integration** in existing React/TypeScript codebase
- **Basic role assignment** and rotation system
- **Essential prompts** and guidance interfaces
- **Topic selection** framework embedded in website
- **Mobile-responsive** design for cross-device access

### Phase 2: Enhanced User Experience (Weeks 5-8)
- **Intelligent prompt timing** based on conversation flow
- **Adaptive assistance** levels based on user experience
- **Quality improvement** features and error handling
- **Large group breakout** functionality with automated room creation
- **Session analytics** and user feedback collection

### Phase 3: Community Platform (Weeks 9-12)
- **User matching** and intelligent session coordination
- **Progress tracking** and individual development insights
- **Advanced facilitation** tools and session management
- **Cross-group learning** integration and community features
- **Onboarding system** and user education materials

---

*This design balances the need for guidance and reassurance with respect for the natural flow of conversation, creating a supportive environment for learning this transformative listening practice.*