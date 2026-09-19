import { describe, it, expect, afterEach } from 'vitest';
import { onSnapshot, where } from 'firebase/firestore';
import { FirebaseSignalingService } from '../firebaseSignalingService';

describe('FirebaseSignalingService', () => {
  afterEach(async () => {
    await FirebaseSignalingService.getInstance().disconnect({ skipLeave: true });
  });

  it('listens with sessionId and baseSessionId so Firestore can evaluate membership', async () => {
    const service = FirebaseSignalingService.getInstance();

    await service.initialize('session-abc-lobby-lobby', 'user-1', 'session-abc');

    expect(where).toHaveBeenCalledWith('sessionId', '==', 'session-abc-lobby-lobby');
    expect(where).toHaveBeenCalledWith('baseSessionId', '==', 'session-abc');
    expect(onSnapshot).toHaveBeenCalled();
  });
});
