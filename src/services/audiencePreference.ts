export type AudiencePreference = 'church' | 'open' | 'christadelphian';

export const AUDIENCE_STORAGE_KEY = 'swiftToHear.audience';

export const AUDIENCE_PATHS: Record<AudiencePreference, string> = {
  church: '/for-churches',
  open: '/welcome',
  christadelphian: '/christadelphian',
};

export function isAudiencePreference(value: unknown): value is AudiencePreference {
  return value === 'church' || value === 'open' || value === 'christadelphian';
}

export function getAudiencePreference(): AudiencePreference | null {
  try {
    const raw = localStorage.getItem(AUDIENCE_STORAGE_KEY);
    return isAudiencePreference(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function setAudiencePreference(preference: AudiencePreference): void {
  try {
    localStorage.setItem(AUDIENCE_STORAGE_KEY, preference);
    window.dispatchEvent(new CustomEvent('audience-preference-changed', { detail: preference }));
  } catch {
    // ignore quota / private mode
  }
}

export function clearAudiencePreference(): void {
  try {
    localStorage.removeItem(AUDIENCE_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('audience-preference-changed', { detail: null }));
  } catch {
    // ignore
  }
}

export function pathForAudience(preference: AudiencePreference): string {
  return AUDIENCE_PATHS[preference];
}

/** Next broader pool when the current funnel has nobody waiting. */
export function broadenAudience(
  preference: AudiencePreference
): AudiencePreference | null {
  if (preference === 'christadelphian') return 'church';
  if (preference === 'church') return 'open';
  return null;
}
