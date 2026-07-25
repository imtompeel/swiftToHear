import { useCallback, useEffect, useState } from 'react';
import {
  AudiencePreference,
  clearAudiencePreference,
  getAudiencePreference,
  setAudiencePreference,
} from '../services/audiencePreference';

export function useAudiencePreference() {
  const [preference, setPreferenceState] = useState<AudiencePreference | null>(() =>
    typeof window === 'undefined' ? null : getAudiencePreference()
  );

  useEffect(() => {
    const sync = () => setPreferenceState(getAudiencePreference());
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'swiftToHear.audience') sync();
    };
    const onCustom = () => sync();
    window.addEventListener('storage', onStorage);
    window.addEventListener('audience-preference-changed', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('audience-preference-changed', onCustom as EventListener);
    };
  }, []);

  const setPreference = useCallback((next: AudiencePreference) => {
    setAudiencePreference(next);
    setPreferenceState(next);
  }, []);

  const clearPreference = useCallback(() => {
    clearAudiencePreference();
    setPreferenceState(null);
  }, []);

  return { preference, setPreference, clearPreference };
}
