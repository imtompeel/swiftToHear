export type RoundRole =
  | 'speaker'
  | 'listener'
  | 'scribe'
  | 'observer'
  | 'observer-temporary'
  | 'observer-permanent';

export function getTotalRounds(participantCount: number): number {
  if (participantCount <= 2) return 2;
  if (participantCount === 3) return 3;
  return 4;
}

export function getRoleDisplayKey(role: string | null | undefined): 'speaker' | 'listener' | 'scribe' | 'observer' {
  if (role === 'listener' || role === 'scribe' || role === 'speaker') return role;
  return 'observer';
}

export function getNextRole(
  currentRole: string | null | undefined,
  participantCount: number,
  isPermanentObserver = false
): string {
  if (isPermanentObserver || currentRole === 'observer-permanent') {
    return 'observer-permanent';
  }

  const normalised = currentRole === 'observer-temporary' ? 'observer' : currentRole;

  if (participantCount <= 2) {
    return normalised === 'speaker' ? 'listener' : 'speaker';
  }

  const roleOrder = participantCount === 3
    ? ['speaker', 'listener', 'scribe']
    : ['speaker', 'listener', 'scribe', 'observer'];

  const index = roleOrder.indexOf(normalised || '');
  if (index === -1) return 'speaker';
  return roleOrder[(index + 1) % roleOrder.length];
}
