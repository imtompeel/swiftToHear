import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SessionContext, SessionParticipant } from '../types/sessionContext';
import { QRCodeSVG } from 'qrcode.react';
import { FirestoreSessionService } from '../services/firestoreSessionService';

interface InPersonSessionProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  onComplete?: () => void;
}

export const InPersonSession: React.FC<InPersonSessionProps> = ({
  session,
  participants}) => {
  const { t } = useTranslation();
  
  // Helper function to get only mobile participants (excluding the host)
  const getMobileParticipants = () => {
    return participants.filter(p => p.id !== session.hostId);
  };
  
  // Helper function to get mobile participants with roles (excluding the host)
  const getMobileParticipantsWithRoles = () => {
    return participants.filter(p => p.id !== session.hostId && p.role && p.role !== 'observer');
  };
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentPhase, setCurrentPhase] = useState<'waiting' | 'round' | 'scribe-feedback' | 'round-complete' | 'free-dialogue' | 'completed'>('waiting');
  const [sessionQRCode, setSessionQRCode] = useState<string>('');
  const [showRoundOptions, setShowRoundOptions] = useState<boolean>(false);

  // Generate QR code for participants to join
  useEffect(() => {
    const baseUrl = window.location.origin;
    const joinUrl = `${baseUrl}/in-person/join/${session.sessionId}`;
    setSessionQRCode(joinUrl);
  }, [session.sessionId]);

  // Sync local state with session data from Firestore
  useEffect(() => {
    if (session.currentPhase) {
      setCurrentPhase(session.currentPhase as 'waiting' | 'round' | 'scribe-feedback');
    }
    if (session.currentRound) {
      setCurrentRound(session.currentRound);
    }
  }, [session.currentPhase, session.currentRound]);

  const handleStartSession = async () => {
    try {
      await FirestoreSessionService.updateSessionPhase(session.sessionId, 'round', 1);
      setCurrentPhase('round');
      setCurrentRound(1);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleNextPhase = async () => {
    try {
      if (currentPhase === 'round') {
        // Check if there's a scribe for scribe feedback
        const hasScribe = participants.some(p => p.role === 'scribe');
        if (hasScribe) {
          await FirestoreSessionService.updateSessionPhase(session.sessionId, 'scribe-feedback', currentRound);
          setCurrentPhase('scribe-feedback');
        } else {
          // No scribe, move to next round
          await handleNextRound();
        }
      } else if (currentPhase === 'scribe-feedback') {
        // Move to next round after scribe feedback
        await handleNextRound();
      }
    } catch (error) {
      console.error('Failed to update phase:', error);
    }
  };

  const handleNextRound = async () => {
    try {
      const nextRound = currentRound + 1;
      const roleParticipants = getMobileParticipantsWithRoles();
      
      // Calculate max rounds: each mobile participant should be speaker and listener at least once
      // For 2 people: 2 rounds (each is speaker once, listener once)
      // For 3 people: 3 rounds (each is speaker once, listener once, scribe once)
      // For 4+ people: number of participants (so everyone gets to be speaker and listener)
      const maxRounds = roleParticipants.length;
      
      if (nextRound <= maxRounds) {
        console.log('InPersonSession: Rotating roles for round', nextRound);
        console.log('InPersonSession: Current participants before rotation:', participants.map(p => ({ id: p.id, name: p.name, role: p.role })));
        
        // Rotate roles before updating the round
        const updatedSession = await FirestoreSessionService.rotateRoles(session.sessionId);
        console.log('InPersonSession: Roles rotated, updated participants:', updatedSession?.participants);
        
        // Update session phase and round
        await FirestoreSessionService.updateSessionPhase(session.sessionId, 'round', nextRound);
        setCurrentRound(nextRound);
        setCurrentPhase('round');
        setShowRoundOptions(false);
      } else {
        // All rounds completed - show options
        await FirestoreSessionService.updateSessionPhase(session.sessionId, 'round-complete');
        setCurrentPhase('round-complete');
        setShowRoundOptions(true);
      }
    } catch (error) {
      console.error('Failed to update round:', error);
    }
  };

  const handleRepeatRounds = async () => {
    try {
      console.log('InPersonSession: Starting new set of rounds with role rotation');
      
      // Use the dedicated method for continuing in-person rounds with role rotation
      const updatedSession = await FirestoreSessionService.continueInPersonRounds(session.sessionId, session.hostId);
      console.log('InPersonSession: New round set started with rotated roles:', updatedSession?.participants);
      
      setCurrentRound(1);
      setCurrentPhase('round');
      setShowRoundOptions(false);
    } catch (error) {
      console.error('Failed to repeat rounds:', error);
    }
  };

  const handleStartDialogos = async () => {
    try {
      // Start free dialogue phase (similar to video call sessions)
      await FirestoreSessionService.startFreeDialogue(session.sessionId, session.hostId);
      setCurrentPhase('free-dialogue');
      setShowRoundOptions(false);
    } catch (error) {
      console.error('Failed to start dialogos:', error);
    }
  };

  const handleEndSession = async () => {
    try {
      // End the session
      await FirestoreSessionService.endSession(session.sessionId, session.hostId);
      setCurrentPhase('completed');
      setShowRoundOptions(false);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-2">
          {t('dialectic.session.inPerson.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          {session.sessionName}
        </p>
      </div>

      {/* QR Code Section */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100">
            {t('dialectic.session.inPerson.qrCode.title')}
          </h2>
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            {getMobileParticipants().length} participant{getMobileParticipants().length !== 1 ? 's' : ''} joined
          </div>
        </div>
        <div className="text-center">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg inline-block mb-4">
            <div className="w-48 h-48 bg-white border-2 border-gray-300 flex items-center justify-center p-2">
              <QRCodeSVG
                value={sessionQRCode}
                size={176}
                level="M"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
          </div>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            {t('dialectic.session.inPerson.qrCode.instructions')}
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <p className="text-xs text-secondary-500 dark:text-secondary-500 break-all">
              {sessionQRCode}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sessionQRCode);
                // You could add a toast notification here if you have one
              }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex-shrink-0"
              title={t('dialectic.session.inPerson.copyLinkTitle')}
                          >
                {t('dialectic.session.inPerson.copyLink')}
              </button>
          </div>
        </div>
      </div>

      {/* Check-in Reminder */}
      {currentPhase === 'waiting' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-lg p-6 border border-blue-200 dark:border-blue-700">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            {t('dialectic.session.inPerson.checkIn.title')}
          </h2>
          <div className="space-y-3">
            <p className="text-blue-800 dark:text-blue-200">
              <strong>{t('dialectic.session.inPerson.checkIn.remember')}</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-300 ml-4">
              <li>{t('dialectic.session.inPerson.checkIn.introduce')}</li>
              <li>{t('dialectic.session.inPerson.checkIn.share')}</li>
              <li>{t('dialectic.session.inPerson.checkIn.intentions')}</li>
              <li>{t('dialectic.session.inPerson.checkIn.ready')}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Session Controls */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-4">
          {t('dialectic.session.inPerson.controls.title')}
        </h2>
        
        <div className="space-y-4">
          {/* Current Phase Display */}
          <div className="text-center p-4 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
            <p className="text-lg font-medium text-primary-900 dark:text-primary-100">
              {currentPhase === 'waiting' && t('dialectic.session.inPerson.currentPhase.waiting')}
              {currentPhase === 'round' && t('dialectic.session.inPerson.currentPhase.round', { round: currentRound })}
              {currentPhase === 'scribe-feedback' && t('dialectic.session.inPerson.currentPhase.scribeFeedback', { round: currentRound })}
              {currentPhase === 'round-complete' && t('dialectic.session.inPerson.currentPhase.roundComplete')}
              {currentPhase === 'free-dialogue' && t('dialectic.session.inPerson.currentPhase.freeDialogue')}
              {currentPhase === 'completed' && t('dialectic.session.inPerson.currentPhase.completed')}
            </p>
            {currentPhase === 'round' && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                {t('dialectic.session.inPerson.phaseDescriptions.round')}
              </p>
            )}
            {currentPhase === 'scribe-feedback' && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                {t('dialectic.session.inPerson.phaseDescriptions.scribeFeedback', { round: currentRound })}
              </p>
            )}
            {currentPhase === 'round-complete' && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                {t('dialectic.session.inPerson.phaseDescriptions.roundComplete')}
              </p>
            )}
            {currentPhase === 'free-dialogue' && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                {t('dialectic.session.inPerson.phaseDescriptions.freeDialogue')}
              </p>
            )}
          </div>

          {/* Round Completion Options */}
          {showRoundOptions && currentPhase === 'round-complete' && (
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
                {t('dialectic.session.inPerson.roundOptions.title')}
              </h3>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleRepeatRounds}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t('dialectic.session.inPerson.roundOptions.repeatRounds')}
                </button>
                <button
                  onClick={handleStartDialogos}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  {t('dialectic.session.inPerson.roundOptions.startDialogos')}
                </button>
                <button
                  onClick={handleEndSession}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {t('dialectic.session.inPerson.roundOptions.endSession')}
                </button>
              </div>
              <div className="mt-4 text-sm text-green-700 dark:text-green-300">
                <p className="mb-2">
                  <strong>Repeat Rounds:</strong> {t('dialectic.session.inPerson.roundOptions.repeatRoundsDescription')}
                </p>
                <p>
                  <strong>Start Dialogos:</strong> Begin free-flowing conversation without role restrictions
                </p>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            {currentPhase === 'waiting' && (
              <button
                onClick={handleStartSession}
                className="px-6 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
              >
                {t('dialectic.session.inPerson.controls.startSession')}
              </button>
            )}
            
            {(currentPhase === 'round' || currentPhase === 'scribe-feedback') && (
              <>
                <button
                  onClick={handleNextPhase}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {currentPhase === 'round' ? t('dialectic.session.inPerson.controlButtons.completeRound') : t('dialectic.session.inPerson.controlButtons.nextRound')}
                </button>
                
                <button
                  onClick={() => setCurrentPhase('waiting')}
                  className="px-6 py-3 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                >
                  {t('dialectic.session.inPerson.controls.pause')}
                </button>
              </>
            )}

            {currentPhase === 'free-dialogue' && (
              <button
                onClick={handleEndSession}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {t('dialectic.session.inPerson.controlButtons.endSession')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Session Status */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-4">
          {t('dialectic.session.inPerson.status.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {getMobileParticipants().filter(p => p.role === 'speaker').length}
            </p>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {t('dialectic.roles.speaker.title')}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {getMobileParticipants().filter(p => p.role === 'listener').length}
            </p>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {t('dialectic.roles.listener.title')}
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {getMobileParticipants().filter(p => p.role === 'scribe').length}
            </p>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {t('dialectic.roles.scribe.title')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
