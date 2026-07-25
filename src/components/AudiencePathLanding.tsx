import React, { useEffect } from 'react';
import LandingPage from './LandingPage';
import {
  AudiencePreference,
  setAudiencePreference,
} from '../services/audiencePreference';

interface AudiencePathLandingProps {
  audience: AudiencePreference;
}

/** Path landing that persists sticky audience preference when visited directly. */
export const AudiencePathLanding: React.FC<AudiencePathLandingProps> = ({
  audience,
}) => {
  useEffect(() => {
    setAudiencePreference(audience);
  }, [audience]);

  return <LandingPage variant={audience} />;
};

export default AudiencePathLanding;
