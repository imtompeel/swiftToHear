import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import SessionTypeSelector from './SessionTypeSelector';
import DurationSelector from './DurationSelector';
import TopicSuggestions from './TopicSuggestions';

import HostRoleSelector from './HostRoleSelector';
import ParticipantLimits from './ParticipantLimits';
import GroupConfiguration from './GroupConfiguration';
import SessionPreview from './SessionPreview';
import ShareLink from './ShareLink';
import { SessionCreationProps, SessionCreationState, SessionData, TopicSuggestion } from './types';

type Step = 'session-type' | 'duration' | 'topics' | 'host-role' | 'participant-limits' | 'group-config' | 'preview';

const StepByStepSessionCreation: React.FC<SessionCreationProps> = ({ onSessionCreate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [state, setState] = useState<SessionCreationState>({
    selectedDuration: 7 * 60 * 1000, // 7 minutes per round default
    customDuration: '',
    sessionName: '',
    topic: '',
    hostTopicSuggestions: [],
    newTopicSuggestion: '',
    validationError: '',
    isCreating: false,
    sessionCreated: false,
    sessionLink: '',
    hostRole: 'participant',
    sessionType: 'video',
    maxParticipants: 4,
    customMaxParticipants: '',
    groupConfiguration: {
      groupSize: 'mixed',
      autoAssignRoles: true,
      groupRotation: 'balanced',
      observerStrategy: 'distribute'
    }
  });

  const [currentStep, setCurrentStep] = useState<Step>('session-type');
  const [stepValidation, setStepValidation] = useState<Record<Step, boolean>>({
    'session-type': true,
    'duration': true,
    'topics': true,
    'host-role': true,
    'group-config': true,
    'preview': true
  });

  // Generate default session name with timestamp
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    setState(prev => ({ ...prev, sessionName: `Dialectic Session - ${dateStr}` }));
  }, []);

  // Update step validation when state changes

  // Handle step changes when session type changes
  useEffect(() => {
    // If user switches from in-person to video and is currently on participant-limits step,
    // move them to the next available step
    if (state.sessionType === 'video' && currentStep === 'participant-limits') {
      setCurrentStep('group-config');
    }
    
    // Update step validation to include/exclude participant-limits based on session type
    setStepValidation(prev => {
      if (state.sessionType === 'in-person') {
        return { ...prev, 'participant-limits': true };
      } else {
        const { 'participant-limits': _, ...rest } = prev;
        return rest;
      }
    });
  }, [state.sessionType, currentStep]);

  // Step configuration - conditionally include participant-limits for in-person sessions
  const steps: Array<{ id: Step; title: string; description: string; required: boolean }> = [
    { id: 'session-type', title: t('dialectic.creation.steps.sessionType'), description: t('dialectic.creation.steps.sessionTypeDesc'), required: true },
    { id: 'duration', title: t('dialectic.creation.steps.duration'), description: t('dialectic.creation.steps.durationDesc'), required: true },
    { id: 'topics', title: t('dialectic.creation.steps.topics'), description: t('dialectic.creation.steps.topicsDesc'), required: false },
    { id: 'host-role', title: t('dialectic.creation.steps.hostRole'), description: t('dialectic.creation.steps.hostRoleDesc'), required: true },
    ...(state.sessionType === 'in-person' ? [{ id: 'participant-limits' as Step, title: t('dialectic.creation.steps.participantLimits'), description: t('dialectic.creation.steps.participantLimitsDesc'), required: false }] : []),
    { id: 'group-config', title: t('dialectic.creation.steps.groupConfig'), description: t('dialectic.creation.steps.groupConfigDesc'), required: false },
    { id: 'preview', title: t('dialectic.creation.steps.preview'), description: t('dialectic.creation.steps.previewDesc'), required: true }
  ];

  // Navigation functions
  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStepId = steps[currentIndex + 1].id;
      setCurrentStep(nextStepId);
    }
  };

  const previousStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStepId = steps[currentIndex - 1].id;
      setCurrentStep(prevStepId);
    }
  };

  const canProceedToStep = (step: Step) => {
    const stepIndex = steps.findIndex(s => s.id === step);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    // Can always go back
    if (stepIndex < currentIndex) return true;
    
    // Check if all required steps up to this point are valid
    for (let i = 0; i <= stepIndex; i++) {
      if (steps[i].required && !stepValidation[steps[i].id]) {
        return false;
      }
    }
    return true;
  };

  // Event handlers
  const handleDurationSelect = (duration: number) => {
    setState(prev => ({
      ...prev,
      selectedDuration: duration,
      customDuration: '',
      validationError: ''
    }));
  };

  const handleCustomDurationChange = (value: string) => {
    setState(prev => ({ ...prev, customDuration: value }));
    
    if (value === '') {
      setState(prev => ({ ...prev, validationError: '' }));
      return;
    }
    
    const minutes = parseInt(value);
    
    if (isNaN(minutes)) {
      setState(prev => ({ ...prev, validationError: t('dialectic.creation.duration.minError') }));
      return;
    }
    
    if (minutes < 3) {
      setState(prev => ({ ...prev, validationError: t('dialectic.creation.duration.minError') }));
      return;
    }
    
    if (minutes > 30) {
      setState(prev => ({ ...prev, validationError: t('dialectic.creation.duration.maxError') }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      validationError: '',
      selectedDuration: minutes * 60 * 1000
    }));
  };

  const handleAddTopicSuggestion = () => {
    if (state.newTopicSuggestion.trim() && !state.hostTopicSuggestions.includes(state.newTopicSuggestion.trim())) {
      setState(prev => ({
        ...prev,
        hostTopicSuggestions: [...prev.hostTopicSuggestions, prev.newTopicSuggestion.trim()],
        newTopicSuggestion: ''
      }));
    }
  };

  const handleRemoveTopicSuggestion = (index: number) => {
    setState(prev => ({
      ...prev,
      hostTopicSuggestions: prev.hostTopicSuggestions.filter((_, i) => i !== index)
    }));
  };

  const handleSampleTopicClick = (sampleTopic: string) => {
    if (!state.hostTopicSuggestions.includes(sampleTopic)) {
      setState(prev => ({
        ...prev,
        hostTopicSuggestions: [...prev.hostTopicSuggestions, sampleTopic]
      }));
    }
  };

  const generateSessionId = () => {
    return 'session-' + Math.random().toString(36).substr(2, 9);
  };

  const handleCreateSession = async () => {
    if (!state.sessionName.trim()) {
      setState(prev => ({ ...prev, validationError: t('dialectic.creation.sessionName.required') }));
      return;
    }

    if (state.validationError) {
      return;
    }

    setState(prev => ({ ...prev, isCreating: true }));

    try {
      // Convert host topic suggestions to TopicSuggestion format
      const hostSuggestions: TopicSuggestion[] = state.hostTopicSuggestions.map((suggestion, index) => ({
        id: `host-suggestion-${index}`,
        topic: suggestion,
        suggestedBy: 'Host',
        suggestedByUserId: 'host',
        suggestedAt: new Date(),
        votes: 1,
        voters: ['host']
      }));

      const sessionName = `Dialectic Session ${new Date().toLocaleDateString()}`;
      console.log('Creating session with name:', sessionName);
      
      const sessionData: SessionData = {
        sessionId: generateSessionId(),
        sessionName: sessionName,
        duration: state.selectedDuration,
        topic: state.topic.trim(),
        hostId: 'host-' + Math.random().toString(36).substr(2, 9),
        hostRole: state.hostRole,
        createdAt: new Date(),
        participants: [],
        status: 'waiting',
        topicSuggestions: hostSuggestions,
        groupMode: 'auto',
        groupConfiguration: state.groupConfiguration,
        minParticipants: 2,
        maxParticipants: state.sessionType === 'in-person' ? state.maxParticipants : 20,
        sessionType: state.sessionType
      };

      // Call the parent's onSessionCreate and wait for it to complete
      const createdSession = await onSessionCreate(sessionData);
      console.log('SessionCreation: Session created', { createdSession, sessionData });
      
      // Route based on session type
      if (state.sessionType === 'in-person') {
        const sessionId = createdSession?.sessionId || sessionData.sessionId;
        console.log('SessionCreation: Navigating to in-person host', { sessionId });
        navigate(`/in-person/host/${sessionId}`);
        return;
      }
      
      // For video sessions, show the regular share link
      const sessionId = createdSession?.sessionId || sessionData.sessionId;
      const link = `${window.location.origin}/practice/join/${sessionId}`;
      setState(prev => ({
        ...prev,
        sessionLink: link,
        sessionCreated: true
      }));
      
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setState(prev => ({ ...prev, isCreating: false }));
    }
  };

  const copySessionLink = async () => {
    try {
      await navigator.clipboard.writeText(state.sessionLink);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'session-type':
        return (
          <SessionTypeSelector
            sessionType={state.sessionType}
            onSessionTypeChange={(type) => setState(prev => ({ ...prev, sessionType: type }))}
          />
        );

      case 'duration':
        return (
          <DurationSelector
            selectedDuration={state.selectedDuration}
            customDuration={state.customDuration}
            validationError={state.validationError}
            onDurationSelect={handleDurationSelect}
            onCustomDurationChange={handleCustomDurationChange}
          />
        );

      case 'topics':
        return (
          <TopicSuggestions
            hostTopicSuggestions={state.hostTopicSuggestions}
            newTopicSuggestion={state.newTopicSuggestion}
            onNewTopicSuggestionChange={(value) => setState(prev => ({ ...prev, newTopicSuggestion: value }))}
            onAddTopicSuggestion={handleAddTopicSuggestion}
            onRemoveTopicSuggestion={handleRemoveTopicSuggestion}
            onSampleTopicClick={handleSampleTopicClick}
          />
        );



      case 'host-role':
        return (
          <HostRoleSelector
            hostRole={state.hostRole}
            onHostRoleChange={(role) => setState(prev => ({ ...prev, hostRole: role }))}
          />
        );

      case 'participant-limits':
        return state.sessionType === 'in-person' ? (
          <ParticipantLimits
            maxParticipants={state.maxParticipants}
            customMaxParticipants={state.customMaxParticipants}
            selectedDuration={state.selectedDuration}
            onMaxParticipantsChange={(count) => setState(prev => ({ ...prev, maxParticipants: count }))}
            onCustomMaxParticipantsChange={(value) => setState(prev => ({ ...prev, customMaxParticipants: value }))}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-secondary-600 dark:text-secondary-400">
              {t('dialectic.creation.steps.participantLimitsSkip')}
            </p>
          </div>
        );

      case 'group-config':
        return (
                  <GroupConfiguration
          groupConfiguration={state.groupConfiguration}
          onGroupConfigurationChange={(config) => setState(prev => ({ ...prev, groupConfiguration: config }))}
        />
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <SessionPreview
              sessionType={state.sessionType}
              selectedDuration={state.selectedDuration}
              hostRole={state.hostRole}
              maxParticipants={state.maxParticipants}
            />
            
            <div className="text-center">
              <button
                onClick={handleCreateSession}
                disabled={state.isCreating || !!state.validationError}
                className="px-8 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors"
                data-testid="create-session-button"
              >
                {state.isCreating ? t('dialectic.creation.creating') : t('dialectic.creation.create')}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (state.sessionCreated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
            {t('dialectic.creation.title')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t('dialectic.creation.description')}
          </p>
        </div>
        <ShareLink 
          sessionLink={state.sessionLink}
          onCopyLink={copySessionLink}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6" data-testid="step-by-step-session-creation">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
          {t('dialectic.creation.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          {t('dialectic.creation.description')}
        </p>
        <div className="mt-4">
          <Link
            to="/admin/safety"
            className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            View Safety Guidelines
          </Link>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-1">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            const canNavigate = canProceedToStep(step.id);
            const isValid = stepValidation[step.id];

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => canNavigate && goToStep(step.id)}
                  disabled={!canNavigate}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all text-xs ${
                    isActive
                      ? 'bg-accent-500 text-white shadow-lg'
                      : isCompleted
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : canNavigate
                      ? 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 dark:bg-secondary-700 dark:text-secondary-300'
                      : 'bg-secondary-50 text-secondary-400 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${
                    isActive
                      ? 'bg-white text-accent-500'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-secondary-300 text-secondary-600'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className="hidden md:inline ml-1">{step.title}</span>
                </button>
                
                {index < steps.length - 1 && (
                  <div className={`w-4 h-0.5 mx-1 ${
                    isCompleted ? 'bg-green-300' : 'bg-secondary-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100">
            {steps.find(s => s.id === currentStep)?.title}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400">
            {steps.find(s => s.id === currentStep)?.description}
          </p>
        </div>
        
        {renderStepContent()}
      </div>

      {/* Navigation */}
      {currentStep !== 'preview' && (
        <div className="flex justify-between items-center">
          <button
            onClick={previousStep}
            disabled={steps.findIndex(s => s.id === currentStep) === 0}
            className="px-6 py-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← {t('dialectic.creation.steps.previous')}
          </button>

          <div className="text-sm text-secondary-500 dark:text-secondary-400">
            {t('dialectic.creation.steps.progress', { 
              current: steps.findIndex(s => s.id === currentStep) + 1, 
              total: steps.length 
            })}
          </div>

          <button
            onClick={nextStep}
            disabled={!stepValidation[currentStep]}
            className="px-6 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors"
          >
            {t('dialectic.creation.steps.next')} →
          </button>
        </div>
      )}
    </div>
  );
};

export default StepByStepSessionCreation;
