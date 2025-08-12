# Session Creation Components

This directory contains modularised components for the step-by-step session creation process, providing an improved user experience with guided flow and progress tracking.

## Components

### Core Components

- **`SessionTypeSelector.tsx`** - Component for selecting video vs in-person sessions
- **`DurationSelector.tsx`** - Component for selecting session duration with custom input
- **`TopicSuggestions.tsx`** - Component for managing host topic suggestions
- **`SessionNameInput.tsx`** - Component for session name input with validation
- **`HostRoleSelector.tsx`** - Component for selecting host role (participant vs observer)
- **`ParticipantLimits.tsx`** - Component for setting participant limits (in-person only)
- **`GroupConfiguration.tsx`** - Component for group configuration settings
- **`SessionPreview.tsx`** - Component for displaying session preview
- **`ShareLink.tsx`** - Component for displaying and copying session share link

### Main Components

- **`StepByStepSessionCreation.tsx`** - Step-by-step wizard with progress tracking
- **`StepByStepSessionCreationWrapper.tsx`** - Wrapper component with authentication and error handling

### Types and Utilities

- **`types.ts`** - TypeScript interfaces and types for all components
- **`index.ts`** - Export file for easy importing

## Usage

### Basic Usage

```tsx
import { StepByStepSessionCreation } from './components/session-creation';

// Use the step-by-step version
<StepByStepSessionCreation onSessionCreate={handleSessionCreate} />
```

### With Wrapper (Recommended)

```tsx
import StepByStepSessionCreationWrapper from './components/session-creation/StepByStepSessionCreationWrapper';

// Use the wrapper for authentication and error handling
<StepByStepSessionCreationWrapper />
```

### Individual Components

You can also use individual components for custom implementations:

```tsx
import { SessionTypeSelector, DurationSelector } from './components/session-creation';

<SessionTypeSelector
  sessionType={sessionType}
  onSessionTypeChange={setSessionType}
/>

<DurationSelector
  selectedDuration={duration}
  customDuration={customDuration}
  validationError={error}
  onDurationSelect={setDuration}
  onCustomDurationChange={setCustomDuration}
/>
```

## Features

### Step-by-Step Wizard

The step-by-step version includes:

- **Progress Tracking** - Visual progress indicator with step numbers
- **Validation** - Step-by-step validation with required field checking
- **Navigation** - Previous/Next buttons with conditional enabling
- **Step Skipping** - Optional steps can be skipped (e.g., participant limits for video sessions)
- **Responsive Design** - Mobile-friendly step navigation
- **Authentication** - Built-in authentication checks
- **Error Handling** - Comprehensive error handling and display

### Modular Design Benefits

- **Reusability** - Each component can be used independently
- **Maintainability** - Smaller, focused components are easier to maintain
- **Testability** - Individual components can be tested in isolation
- **Flexibility** - Easy to create custom layouts and flows

## Translation Keys

The components use the following translation keys (add to your i18n files):

```json
{
  "dialectic": {
    "creation": {
      "steps": {
        "sessionType": "Session Type",
        "sessionTypeDesc": "Choose how participants will join your session",
        "duration": "Round Length",
        "durationDesc": "Set how long each speaking round will be",
        "topics": "Topic Suggestions",
        "topicsDesc": "Add topics you'd like to explore together",
        "sessionName": "Session Name",
        "sessionNameDesc": "Give your session a memorable name",
        "hostRole": "Your Role",
        "hostRoleDesc": "Choose whether to participate or observe",
        "participantLimits": "Participant Limits",
        "participantLimitsDesc": "Set maximum participants for in-person sessions",
        "participantLimitsSkip": "Participant limits are only needed for in-person sessions",
        "groupConfig": "Group Settings",
        "groupConfigDesc": "Configure how groups and roles will be assigned",
        "preview": "Review & Create",
        "previewDesc": "Review your session settings and create the session",
        "complete": "Session Created",
        "completeDesc": "Your session has been created successfully",
        "previous": "Previous",
        "next": "Next",
        "progress": "Step {{current}} of {{total}}"
      }
    }
  }
}
```

## Styling

All components use Tailwind CSS classes and follow the existing design system with:

- Dark mode support
- Responsive design
- Consistent spacing and typography
- Accessible form controls
- UK spelling throughout

## Testing

Each component includes `data-testid` attributes for easy testing:

- `session-creation-component`
- `session-type-selector`
- `duration-selector`
- `session-name-input`
- `create-session-button`
- `step-by-step-session-creation`

## Migration from Original

To migrate from the original `SessionCreation.tsx`:

1. Replace the import:
   ```tsx
   // Old
   import { SessionCreation } from './components/SessionCreation';
   
   // New
   import StepByStepSessionCreationWrapper from './components/session-creation/StepByStepSessionCreationWrapper';
   ```

2. Replace the component usage:
   ```tsx
   // Old
   <SessionCreation onSessionCreate={handleSessionCreate} />
   
   // New
   <StepByStepSessionCreationWrapper />
   ```

3. The wrapper handles authentication and error handling automatically
