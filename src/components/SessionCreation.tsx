import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { GroupConfiguration } from '../types/groupSession';

interface SessionCreationProps {
  onSessionCreate: (sessionData: SessionData) => Promise<void>;
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
  groupMode?: 'single' | 'multi';
  groupConfiguration?: GroupConfiguration;
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
  const [selectedDuration, setSelectedDuration] = useState(15 * 60 * 1000); // 15 minutes default
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
  
  // Group session state
  const [groupMode, setGroupMode] = useState<'single' | 'multi'>('single');
  const [groupConfiguration, setGroupConfiguration] = useState<GroupConfiguration>({
    groupSize: 4,
    autoAssignRoles: true,
    groupRotation: 'balanced',
    observerStrategy: 'distribute'
  });

  const durationOptions = [
    { value: 5 * 60 * 1000, label: '5', description: t('dialectic.creation.duration.options.5') },
    { value: 10 * 60 * 1000, label: '10', description: t('dialectic.creation.duration.options.10') },
    { value: 15 * 60 * 1000, label: '15', description: t('dialectic.creation.duration.options.15') },
    { value: 20 * 60 * 1000, label: '20', description: t('dialectic.creation.duration.options.20') },
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
    
    if (minutes > 60) {
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
        groupConfiguration: groupMode === 'multi' ? groupConfiguration : undefined
      };

      // Call the parent's onSessionCreate and wait for it to complete
      await onSessionCreate(sessionData);
      
      // Generate shareable link
      const link = `${window.location.origin}/practice/join/${sessionData.sessionId}`;
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
      </div>

      <div className="space-y-8" data-testid="session-creation-form">
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
                  {option.label} {t('dialectic.creation.duration.minutes')}
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
              max="60"
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

        {/* Group Mode Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
              {t('dialectic.creation.groupMode.label')}
            </label>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              {t('dialectic.creation.groupMode.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setGroupMode('single')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                groupMode === 'single'
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-900'
                  : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
              }`}
              data-testid="group-mode-single"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <div className="font-semibold text-primary-900 dark:text-primary-100">
                    {t('dialectic.creation.groupMode.single.title')}
                  </div>
                  <div className="text-xs text-accent-600 dark:text-accent-400">
                    {t('dialectic.creation.groupMode.single.badge')}
                  </div>
                </div>
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t('dialectic.creation.groupMode.single.description')}
              </div>
            </button>

            <button
              onClick={() => setGroupMode('multi')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                groupMode === 'multi'
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-900'
                  : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
              }`}
              data-testid="group-mode-multi"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">🔀</span>
                <div>
                  <div className="font-semibold text-primary-900 dark:text-primary-100">
                    {t('dialectic.creation.groupMode.multi.title')}
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {t('dialectic.creation.groupMode.multi.badge')}
                  </div>
                </div>
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t('dialectic.creation.groupMode.multi.description')}
              </div>
            </button>
          </div>
        </div>

        {/* Group Configuration - Only show for multi-group mode */}
        {groupMode === 'multi' && (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
                {t('dialectic.creation.groupConfig.label')}
              </label>
              <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                {t('dialectic.creation.groupConfig.description')}
              </p>
            </div>

            {/* Group Size Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-primary-900 dark:text-primary-100">
                {t('dialectic.creation.groupConfig.groupSize.label')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 4, 'mixed'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setGroupConfiguration(prev => ({ ...prev, groupSize: size as 3 | 4 | 'mixed' }))}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      groupConfiguration.groupSize === size
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900'
                        : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
                    }`}
                  >
                    <div className="font-semibold text-primary-900 dark:text-primary-100">
                      {size === 'mixed' ? t('dialectic.creation.groupConfig.groupSize.mixed') : size}
                    </div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">
                      {size === 'mixed' 
                        ? t('dialectic.creation.groupConfig.groupSize.mixedDesc')
                        : t('dialectic.creation.groupConfig.groupSize.people', { count: size })
                      }
                    </div>
                  </button>
                ))}
              </div>
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

            {/* Observer Strategy */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-primary-900 dark:text-primary-100">
                {t('dialectic.creation.groupConfig.observerStrategy.label')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['distribute', 'central'].map((strategy) => (
                  <button
                    key={strategy}
                    onClick={() => setGroupConfiguration(prev => ({ ...prev, observerStrategy: strategy as 'distribute' | 'central' }))}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      groupConfiguration.observerStrategy === strategy
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900'
                        : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
                    }`}
                  >
                    <div className="font-semibold text-primary-900 dark:text-primary-100">
                      {t(`dialectic.creation.groupConfig.observerStrategy.${strategy}.title`)}
                    </div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">
                      {t(`dialectic.creation.groupConfig.observerStrategy.${strategy}.description`)}
                    </div>
                  </button>
                ))}
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
            <p>{t('dialectic.creation.preview.duration', { duration: formatDuration(selectedDuration) })}</p>
            <p>{t('dialectic.creation.preview.participants')}</p>
            <p>{t('dialectic.creation.preview.format')}</p>
            <p>{t('dialectic.creation.preview.hostRole', { role: hostRole === 'participant' ? t('dialectic.creation.hostRole.participant.title') : t('dialectic.creation.hostRole.observer.title') })}</p>
            <p>{t('dialectic.creation.preview.groupMode', { mode: groupMode === 'single' ? t('dialectic.creation.groupMode.single.title') : t('dialectic.creation.groupMode.multi.title') })}</p>
            {groupMode === 'multi' && (
              <p>{t('dialectic.creation.preview.groupConfig', { 
                size: groupConfiguration.groupSize === 'mixed' 
                  ? t('dialectic.creation.groupConfig.groupSize.mixed')
                  : groupConfiguration.groupSize.toString(),
                strategy: t(`dialectic.creation.groupConfig.observerStrategy.${groupConfiguration.observerStrategy}.title`)
              })}</p>
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

        {/* Participant Info */}
        <div className="text-center text-sm text-secondary-500 dark:text-secondary-400" data-testid="participant-info">
          {t('dialectic.creation.preview.participants')}
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