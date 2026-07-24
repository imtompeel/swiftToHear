import { WebRTCService } from '../webrtcService';
import { DailyVideoProvider } from './dailyVideoProvider';
import { getConfiguredVideoProvider, type VideoProvider } from './types';

/**
 * Create the configured video provider.
 * mesh (default): existing WebRTC mesh + Firestore signalling + TURN
 * daily: Daily.co SFU (requires VITE_DAILY_TOKEN_URL)
 */
export function createVideoProvider(): VideoProvider {
  const kind = getConfiguredVideoProvider();
  if (kind === 'daily') {
    console.log('🟢 VIDEO - Using Daily.co SFU provider');
    return new DailyVideoProvider();
  }

  console.log('🟢 VIDEO - Using mesh WebRTC provider');
  return WebRTCService.getInstance();
}
