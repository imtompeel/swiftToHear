import React, { useState } from 'react';
import LandingPage from './LandingPage';
import { ChristadelphianGateForm } from './ChristadelphianGateForm';
import { setAudiencePreference } from '../services/audiencePreference';
import { isChristadelphianUnlocked } from '../services/christadelphianGate';

/**
 * Christadelphian landing — hymn-book password gate, then sticky preference + landing.
 */
export const ChristadelphianPathLanding: React.FC = () => {
  const [unlocked, setUnlocked] = useState(() => isChristadelphianUnlocked());

  const handleUnlocked = () => {
    setAudiencePreference('christadelphian');
    setUnlocked(true);
  };

  if (!unlocked) {
    return <ChristadelphianGateForm onUnlocked={handleUnlocked} />;
  }

  return <LandingPage variant="christadelphian" />;
};

export default ChristadelphianPathLanding;
