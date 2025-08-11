import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { GroupConfiguration } from '../types/groupSession';

interface SessionCreationProps {
  onSessionCreate: (sessionData: SessionData) => Promise<any>;
}

interface SessionData {
  sessionId: string;
  sessionName: string;
  duration: number;
  topic: string;
  hostId: string;
  hostRole: 'participant' | 'observer-permanent';
  createdAt: Date;
  participants: any[];
  status: 'waiting';
  topicSuggestions: TopicSuggestion[];
  groupMode?: 'single' | 'multi' | 'auto';
  groupConfiguration?: GroupConfiguration;
  minParticipants: number;
  maxParticipants: number;
  sessionType: 'video' | 'in-person' | 'hybrid';
}

interface TopicSuggestion {
  id: string;
  topic: string;
  suggestedBy: string;
  suggestedByUserId: string;
  suggestedAt: Date;
  votes: number;
  voters: string[];
}

const SessionCreation: React.FC<SessionCreationProps> = ({ onSessionCreate }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState(7 * 60 * 1000); // 7 minutes per round default
  const [customDuration, setCustomDuration] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [topic] = useState('');
  const [hostTopicSuggestions, setHostTopicSuggestions] = useState<string[]>([]);
  const [newTopicSuggestion, setNewTopicSuggestion] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionLink, setSessionLink] = useState('');
  const [hostRole, setHostRole] = useState<'participant' | 'observer-permanent'>('participant');
  const [sessionType, setSessionType] = useState<'video' | 'in-person' | 'hybrid'>('video');
  const [maxParticipants, setMaxParticipants] = useState<number>(4);
  const [customMaxParticipants, setCustomMaxParticipants] = useState<string>('');
  
  // Group session state - will be determined dynamically as participants join
  const [groupConfiguration, setGroupConfiguration] = useState<GroupConfiguration>({
    groupSize: 'mixed',
    autoAssignRoles: true,
    groupRotation: 'balanced',
    observerStrategy: 'distribute'
  });

  // Session type will be determined dynamically based on actual participants joining
  const groupMode = 'auto'; // Will adapt as participants join

  const durationOptions = [
    { value: 2 * 60 * 1000, label: '2', description: t('dialectic.creation.duration.options.2') },
    { value: 5 * 60 * 1000, label: '5', description: t('dialectic.creation.duration.options.5') },
    { value: 7 * 60 * 1000, label: '7', description: t('dialectic.creation.duration.options.7') },
    { value: 10 * 60 * 1000, label: '10', description: t('dialectic.creation.duration.options.10') },
  ];

  const sampleTopics = [
    'What is alive in you right now?',
    'What challenge are you facing?',
    'What transition are you navigating?',
    'What are you learning about yourself?',
    'What matters most to you in this moment?'
  ];

  // Generate default session name with timestamp
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    setSessionName(`Dialectic Session - ${dateStr}`);
  }, []);

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    setCustomDuration('');
    setValidationError('');
  };

  const handleCustomDurationChange = (value: string) => {
    setCustomDuration(value);
    const minutes = parseInt(value);
    
    if (value === '') {
      setValidationError('');
      return;
    }
    
    if (isNaN(minutes)) {
      setValidationError(t('dialectic.creation.duration.minError'));
      return;
    }
    
    if (minutes < 3) {
      setValidationError(t('dialectic.creation.duration.minError'));
      return;
    }
    
    if (minutes > 30) {
      setValidationError(t('dialectic.creation.duration.maxError'));
      return;
    }
    
    setValidationError('');
    setSelectedDuration(minutes * 60 * 1000);
  };


  const handleAddTopicSuggestion = () => {
    if (newTopicSuggestion.trim() && !hostTopicSuggestions.includes(newTopicSuggestion.trim())) {
      setHostTopicSuggestions([...hostTopicSuggestions, newTopicSuggestion.trim()]);
      setNewTopicSuggestion('');
    }
  };

  const handleRemoveTopicSuggestion = (index: number) => {
    setHostTopicSuggestions(hostTopicSuggestions.filter((_, i) => i !== index));
  };

  const handleSampleTopicClick = (sampleTopic: string) => {
    if (!hostTopicSuggestions.includes(sampleTopic)) {
      setHostTopicSuggestions([...hostTopicSuggestions, sampleTopic]);
    }
  };

  const generateSessionId = () => {
    return 'session-' + Math.random().toString(36).substr(2, 9);
  };

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      setValidationError(t('dialectic.creation.sessionName.required'));
      return;
    }

    if (validationError) {
      return;
    }

    setIsCreating(true);

    try {
      // Convert host topic suggestions to TopicSuggestion format
      const hostSuggestions: TopicSuggestion[] = hostTopicSuggestions.map((suggestion, index) => ({
        id: `host-suggestion-${index}`,
        topic: suggestion,
        suggestedBy: 'Host',
        suggestedByUserId: 'host',
        suggestedAt: new Date(),
        votes: 1,
        voters: ['host']
      }));

      const sessionData: SessionData = {
        sessionId: generateSessionId(),
        sessionName: sessionName.trim(),
        duration: selectedDuration,
        topic: topic.trim(),
        hostId: 'host-' + Math.random().toString(36).substr(2, 9),
        hostRole: hostRole,
        createdAt: new Date(),
        participants: [],
        status: 'waiting',
        topicSuggestions: hostSuggestions,
        groupMode: groupMode,
        groupConfiguration: groupConfiguration,
        minParticipants: 2,
        maxParticipants: sessionType === 'in-person' ? maxParticipants : 20, // Use selected max for in-person, flexible for others
        sessionType: sessionType
      };

      // Call the parent's onSessionCreate and wait for it to complete
      const createdSession = await onSessionCreate(sessionData);
      console.log('SessionCreation: Session created', { createdSession, sessionData });
      
      // Route based on session type
      if (sessionType === 'in-person') {
        // Navigate directly to in-person host interface using the created session ID
        const sessionId = createdSession?.sessionId || sessionData.sessionId;
        console.log('SessionCreation: Navigating to in-person host', { sessionId });
        navigate(`/in-person/host/${sessionId}`);
        return;
      }
      
      // For video and hybrid sessions, show the regular share link
      const sessionId = createdSession?.sessionId || sessionData.sessionId;
      const link = `${window.location.origin}/practice/join/${sessionId}`;
      setSessionLink(link);
      setSessionCreated(true);
      
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const copySessionLink = async () => {
    try {
      await navigator.clipboard.writeText(sessionLink);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const formatDuration = (milliseconds: number) => {
    return Math.floor(milliseconds / 60000);
  };

  // Calculate total session time including check-in and feedback periods
  const calculateTotalSessionTime = (roundLengthMinutes: number) => {
    // For a typical session with 3-4 rounds:
    // - 2-3 minute check-in per round
    // - 2.5 minute scribe feedback per round
    // - Round length itself
    const checkInTime = 2.5; // minutes per round
    const feedbackTime = 2.5; // minutes per round
    const totalPerRound = roundLengthMinutes + checkInTime + feedbackTime;
    const estimatedRounds = 3; // Typical number of rounds
    return Math.round(totalPerRound * estimatedRounds);
  };

  // Calculate in-person session time based on number of participants
  const calculateInPersonSessionTime = (participantCount: number, roundLengthMinutes: number) => {
    // Each participant gets to be speaker/listener once
    const totalRounds = participantCount;
    
    // Time per round: round length + scribe feedback
    const checkInTime = 2.5; // minutes per round
    const feedbackTime = 2.5; // minutes per round
    const totalPerRound = roundLengthMinutes + checkInTime + feedbackTime;
    
    return Math.round(totalPerRound * totalRounds);
  };

  if (sessionCreated) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">
            {t('dialectic.creation.shareLink.title')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t('dialectic.creation.shareLink.description')}
          </p>
        </div>

        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div 
              className="text-sm px-3 py-2 rounded border flex-1 mr-3 break-all font-mono"
              style={{
                backgroundColor: `${theme === 'dark' ? '#1f2937' : '#f9fafb'} !important`,
                color: `${theme === 'dark' ? '#f3f4f6' : '#111827'} !important`
              }}
            >
              {sessionLink}
            </div>
            <button
              onClick={copySessionLink}
              className="px-4 py-2 bg-accent-500 text-white rounded hover:bg-accent-600 transition-colors"
            >
              {t('dialectic.creation.shareLink.copy')}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              {t('dialectic.creation.shareLink.qrCode')}
            </p>
            {/* QR code component could be added here */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8" data-testid="session-creation-component">
      <div className="text-center space-y-2">
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

      <div className="space-y-8" data-testid="session-creation-form">
        {/* Session Type Selection */}
        <div className="space-y-4" data-testid="session-type-selector">
          <div>
            <label className="block text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.creation.sessionType.label')}
            </label>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              {t('dialectic.creation.sessionType.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Video Call Option */}
            <button
              onClick={() => setSessionType('video')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                sessionType === 'video'
                  ? 'border-accent-500 bg-accent-50 shadow-lg'
                  : 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
              }`}
              data-testid="session-type-video"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  sessionType === 'video'
                    ? 'bg-accent-500 text-white'
                    : 'bg-secondary-200 text-secondary-600'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
                <div className={`font-semibold ${
                  sessionType === 'video'
                    ? 'text-gray-900'
                    : 'text-primary-900 dark:text-primary-100'
                }`}>
                  {t('dialectic.creation.sessionType.video.title')}
                </div>
              </div>
              <div className={`text-sm ${
                sessionType === 'video'
                  ? 'text-gray-700'
                  : 'text-secondary-600 dark:text-secondary-400'
              }`}>
                {t('dialectic.creation.sessionType.video.description')}
              </div>
            </button>

            {/* In-Person Option */}
            <button
              onClick={() => setSessionType('in-person')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                sessionType === 'in-person'
                  ? 'border-accent-500 bg-accent-50 shadow-lg'
                  : 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
              }`}
              data-testid="session-type-in-person"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  sessionType === 'in-person'
                    ? 'bg-accent-500 text-white'
                    : 'bg-secondary-200 text-secondary-600'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={`font-semibold ${
                  sessionType === 'in-person'
                    ? 'text-gray-900'
                    : 'text-primary-900 dark:text-primary-100'
                }`}>
                  {t('dialectic.creation.sessionType.inPerson.title')}
                </div>
              </div>
              <div className={`text-sm ${
                sessionType === 'in-person'
                  ? 'text-gray-700'
                  : 'text-secondary-600 dark:text-secondary-400'
              }`}>
                {t('dialectic.creation.sessionType.inPerson.description')}
              </div>
            </button>

            {/* Hybrid Option */}
            <button
              onClick={() => setSessionType('hybrid')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                sessionType === 'hybrid'
                  ? 'border-accent-500 bg-accent-50 shadow-lg'
                  : 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
              }`}
              data-testid="session-type-hybrid"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  sessionType === 'hybrid'
                    ? 'bg-accent-500 text-white'
                    : 'bg-secondary-200 text-secondary-600'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className={`font-semibold ${
                  sessionType === 'hybrid'
                    ? 'text-gray-900'
                    : 'text-primary-900 dark:text-primary-100'
                }`}>
                  {t('dialectic.creation.sessionType.hybrid.title')}
                </div>
              </div>
              <div className={`text-sm ${
                sessionType === 'hybrid'
                  ? 'text-gray-700'
                  : 'text-secondary-600 dark:text-secondary-400'
              }`}>
                {t('dialectic.creation.sessionType.hybrid.description')}
              </div>
            </button>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-4" data-testid="duration-selector">
          <div>
            <label className="block text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.creation.duration.label')}
            </label>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              {t('dialectic.creation.duration.description')}
            </p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">
              {t('dialectic.creation.duration.help')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDurationSelect(option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedDuration === option.value
                    ? 'border-accent-500 bg-accent-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
                data-testid={`duration-option-${option.label}`}
              >
                <div className={`font-semibold ${
                  selectedDuration === option.value
                    ? 'text-gray-900'
                    : 'text-primary-900 dark:text-primary-100'
                }`}>
                  {option.label} {t('dialectic.creation.duration.minute')} {t('dialectic.creation.duration.rounds')}
                </div>
                <div className={`text-sm mt-1 ${
                  selectedDuration === option.value
                    ? 'text-gray-700'
                    : 'text-secondary-600 dark:text-secondary-400'
                }`}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300">
              {t('dialectic.creation.duration.custom')}
            </label>
            <input
              type="number"
              value={customDuration}
              onChange={(e) => handleCustomDurationChange(e.target.value)}
              placeholder={t('dialectic.creation.duration.customPlaceholder')}
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-secondary-100"
              data-testid="custom-duration-input"
              min="3"
              max="30"
            />
          </div>

          {validationError && (
            <div className="text-red-600 dark:text-red-400 text-sm" role="alert">
              {validationError}
            </div>
          )}
        </div>

                {/* Host Topic Suggestions */}
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.creation.hostTopics.label')}
            </label>
            <p className="text-secondary-600 dark:text-secondary-400 mb-2">
              {t('dialectic.creation.hostTopics.description')}
            </p>
          </div>

          {/* Add new topic suggestion */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTopicSuggestion}
              onChange={(e) => setNewTopicSuggestion(e.target.value)}
              placeholder={t('dialectic.creation.hostTopics.placeholder')}
              className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-secondary-100"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTopicSuggestion()}
            />
            <button
              onClick={handleAddTopicSuggestion}
              disabled={!newTopicSuggestion.trim()}
              className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('dialectic.creation.hostTopics.add')}
            </button>
          </div>

          {/* Sample topics for quick addition */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {t('dialectic.creation.hostTopics.sampleTopics')}
            </p>
            <div className="flex flex-wrap gap-2">
              {sampleTopics.map((sampleTopic, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleTopicClick(sampleTopic)}
                  disabled={hostTopicSuggestions.includes(sampleTopic)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    hostTopicSuggestions.includes(sampleTopic)
                      ? 'bg-accent-100 text-accent-700 cursor-not-allowed'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {sampleTopic}
                </button>
              ))}
            </div>
          </div>

          {/* Current host topic suggestions */}
          {hostTopicSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {t('dialectic.creation.hostTopics.currentSuggestions')} ({hostTopicSuggestions.length})
              </p>
              <div className="space-y-2">
                {hostTopicSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg"
                  >
                    <span className="text-secondary-900 dark:text-secondary-100">
                      {suggestion}
                    </span>
                    <button
                      onClick={() => handleRemoveTopicSuggestion(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Session Name */}
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.creation.sessionName.label')}
            </label>
            <p className="text-secondary-600 dark:text-secondary-400 mb-2">
              {t('dialectic.creation.sessionName.description')}
            </p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">
              {t('dialectic.creation.sessionName.help')}
            </p>
          </div>

          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder={t('dialectic.creation.sessionName.placeholder')}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-secondary-100"
            data-testid="session-name-input"
          />

          {!sessionName.trim() && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {t('dialectic.creation.sessionName.required')}
            </div>
          )}
        </div>

        {/* Host Role Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.creation.hostRole.label')}
            </label>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              {t('dialectic.creation.hostRole.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setHostRole('participant')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                hostRole === 'participant'
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-900'
                  : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
              }`}
              data-testid="host-role-participant"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <div className="font-semibold text-primary-900 dark:text-primary-100">
                    {t('dialectic.creation.hostRole.participant.title')}
                  </div>
                  <div className="text-xs text-accent-600 dark:text-accent-400">
                    {t('dialectic.creation.hostRole.participant.badge')}
                  </div>
                </div>
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t('dialectic.creation.hostRole.participant.description')}
              </div>
            </button>

            <button
              onClick={() => setHostRole('observer-permanent')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                hostRole === 'observer-permanent'
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-900'
                  : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
              }`}
              data-testid="host-role-observer"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">👁️</span>
                <div>
                  <div className="font-semibold text-primary-900 dark:text-primary-100">
                    {t('dialectic.creation.hostRole.observer.title')}
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {t('dialectic.creation.hostRole.observer.badge')}
                  </div>
                </div>
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t('dialectic.creation.hostRole.observer.description')}
              </div>
            </button>
          </div>
        </div>

        {/* Participant Limits - Only show for in-person sessions */}
        {sessionType === 'in-person' && (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
                {t('dialectic.creation.participantLimits.label')}
              </label>
              <p className="text-secondary-600 dark:text-secondary-400 mb-2">
                {t('dialectic.creation.participantLimits.description')}
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>💡 Tip:</strong> {t('dialectic.creation.participantLimits.tip')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[3, 4, 5, 6].map((num) => {
                const roundLengthMinutes = formatDuration(selectedDuration);
                const totalTimeMinutes = calculateInPersonSessionTime(num, roundLengthMinutes);
                
                return (
                  <button
                    key={num}
                    onClick={() => setMaxParticipants(num)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      maxParticipants === num
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                        : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
                    }`}
                  >
                    <div className={`font-semibold text-lg ${
                      maxParticipants === num
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-primary-900 dark:text-primary-100'
                    }`}>
                      {num}
                    </div>
                    <div className={`text-xs mt-1 ${
                      maxParticipants === num
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-secondary-600 dark:text-secondary-400'
                    }`}>
                      {num === 4 ? t('dialectic.creation.participantLimits.recommended') : num === 5 ? t('dialectic.creation.participantLimits.maximum') : num === 6 ? t('dialectic.creation.participantLimits.splitSessions') : t('dialectic.creation.participantLimits.participants')}
                    </div>
                    <div className={`text-xs mt-1 ${
                      maxParticipants === num
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-secondary-500 dark:text-secondary-500'
                    }`}>
                      ~{Math.round(totalTimeMinutes)} min
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom participant count */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {t('dialectic.creation.participantLimits.custom.label')}:
                </span>
                <input
                  type="number"
                  value={customMaxParticipants}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomMaxParticipants(value);
                    const numValue = parseInt(value);
                    if (numValue >= 3 && numValue <= 10) {
                      setMaxParticipants(numValue);
                    }
                  }}
                  placeholder={t('dialectic.creation.participantLimits.custom.placeholder')}
                  className="w-24 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-secondary-100"
                  min="3"
                  max="10"
                />
                {customMaxParticipants && parseInt(customMaxParticipants) >= 3 && (
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">
                    ~{calculateInPersonSessionTime(parseInt(customMaxParticipants), formatDuration(selectedDuration))} min
                  </div>
                )}
              </div>
              {customMaxParticipants && parseInt(customMaxParticipants) > 5 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>⚠️ Warning:</strong> {t('dialectic.creation.participantLimits.custom.warning')}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>How it works:</strong> {t('dialectic.creation.participantLimits.howItWorks')}
              </p>
            </div>
          </div>
        )}

        {/* Group Configuration - Always show since session type is adaptive */}
        {(
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
                {t('dialectic.creation.groupConfig.label')}
              </label>
              <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                {t('dialectic.creation.groupConfig.description')}
              </p>
            </div>



            {/* Auto-assign Roles */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-primary-900 dark:text-primary-100">
                {t('dialectic.creation.groupConfig.autoAssign.label')}
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={groupConfiguration.autoAssignRoles}
                    onChange={(e) => setGroupConfiguration(prev => ({ ...prev, autoAssignRoles: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    {t('dialectic.creation.groupConfig.autoAssign.description')}
                  </span>
                </label>
              </div>
            </div>


          </div>
        )}

        {/* Session Preview */}
        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 space-y-2" data-testid="session-preview">
          <h3 className="font-medium text-primary-900 dark:text-primary-100">
            {t('dialectic.creation.preview.title')}
          </h3>
          <div className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
            <p><strong>{t('dialectic.creation.preview.sessionType', { type: t(`dialectic.creation.sessionType.${sessionType === 'video' ? 'video' : sessionType === 'in-person' ? 'inPerson' : 'hybrid'}.title`) })}</strong></p>
            <p>{t('dialectic.creation.preview.roundLength', { minutes: formatDuration(selectedDuration) })}</p>
            <p>{t('dialectic.creation.preview.estimatedTotal', { minutes: Math.round(calculateTotalSessionTime(formatDuration(selectedDuration)) * (sessionType === 'in-person' ? maxParticipants / 3 : 1)) })}</p>
            <p>{t('dialectic.creation.preview.format')}</p>
            <p>{t('dialectic.creation.preview.hostRole', { role: hostRole === 'participant' ? t('dialectic.creation.hostRole.participant.title') : t('dialectic.creation.hostRole.observer.title') })}</p>

            <p>{t('dialectic.creation.preview.groupConfig', { 
              size: t('dialectic.creation.groupConfig.groupSize.mixed'),
              strategy: t('dialectic.creation.groupConfig.observerStrategy.distribute.title')
            })}</p>
            {sessionType === 'in-person' && (
              <p><strong>{t('dialectic.creation.participantLimits.preview', { count: maxParticipants })}</strong></p>
            )}
          </div>
        </div>

        {/* Create Button */}
        <div className="text-center">
          <button
            onClick={handleCreateSession}
            disabled={isCreating || !sessionName.trim() || !!validationError}
            className="px-8 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors"
            data-testid="create-session-button"
          >
            {isCreating ? t('dialectic.creation.creating') : t('dialectic.creation.create')}
          </button>
        </div>

        {/* Session Info */}
        <div className="text-center text-sm text-secondary-500 dark:text-secondary-400" data-testid="session-info">
          {t('dialectic.creation.preview.sessionInfo')}
        </div>
      </div>

      {/* Mobile Layout Indicator */}
      <div className="hidden md:block" data-testid="mobile-optimized-layout">
        {/* Mobile-specific layout adjustments would go here */}
      </div>
    </div>
  );
};

export { SessionCreation }; 