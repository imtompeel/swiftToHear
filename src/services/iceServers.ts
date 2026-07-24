/**
 * ICE server configuration for WebRTC.
 *
 * Priority:
 * 1. Metered.ca TURN credentials API (VITE_METERED_TURN_API_KEY)
 * 2. Static TURN from env (VITE_TURN_URLS + username/credential)
 * 3. Google STUN only (fallback — many NATs will fail without TURN)
 */

export type IceServerConfig = RTCIceServer;

const GOOGLE_STUN_SERVERS: IceServerConfig[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

let cachedServers: IceServerConfig[] | null = null;
let cacheExpiresAt = 0;

function parseTurnUrls(raw: string): string | string[] {
  const urls = raw.split(',').map(u => u.trim()).filter(Boolean);
  return urls.length === 1 ? urls[0] : urls;
}

function staticTurnFromEnv(): IceServerConfig[] {
  const turnUrls = import.meta.env.VITE_TURN_URLS?.trim();
  if (!turnUrls) {
    return [];
  }

  const username = import.meta.env.VITE_TURN_USERNAME?.trim();
  const credential = import.meta.env.VITE_TURN_CREDENTIAL?.trim();

  const server: IceServerConfig = {
    urls: parseTurnUrls(turnUrls),
  };

  if (username && credential) {
    server.username = username;
    server.credential = credential;
  }

  return [server];
}

/**
 * Fetch time-limited TURN credentials from Metered / Open Relay.
 * Set VITE_METERED_TURN_ENDPOINT to your Metered app base, e.g.
 * https://yourapp.metered.live  or  https://openrelay.metered.ca/openrelayproject
 */
async function fetchMeteredTurnServers(apiKey: string): Promise<IceServerConfig[]> {
  const base = (
    import.meta.env.VITE_METERED_TURN_ENDPOINT ||
    'https://openrelay.metered.ca/openrelayproject'
  ).replace(/\/$/, '');

  const response = await fetch(
    `${base}/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`
  );

  if (!response.ok) {
    throw new Error(`Metered TURN credentials failed: ${response.status}`);
  }

  return (await response.json()) as IceServerConfig[];
}

/**
 * Resolve ICE servers for peer connections. Results are cached briefly.
 */
export async function getIceServers(): Promise<IceServerConfig[]> {
  const now = Date.now();
  if (cachedServers && now < cacheExpiresAt) {
    return cachedServers;
  }

  const servers: IceServerConfig[] = [...GOOGLE_STUN_SERVERS];

  const meteredKey = import.meta.env.VITE_METERED_TURN_API_KEY?.trim();
  if (meteredKey) {
    try {
      const turnServers = await fetchMeteredTurnServers(meteredKey);
      servers.push(...turnServers);
      cachedServers = servers;
      // Metered credentials are typically valid for ~24h; refresh hourly
      cacheExpiresAt = now + 60 * 60 * 1000;
      return servers;
    } catch (error) {
      console.warn('🟡 ICE - Metered TURN fetch failed, trying static TURN:', error);
    }
  }

  const staticTurn = staticTurnFromEnv();
  if (staticTurn.length > 0) {
    servers.push(...staticTurn);
  } else if (!meteredKey) {
    console.warn(
      '🟡 ICE - No TURN configured (set VITE_METERED_TURN_API_KEY or VITE_TURN_URLS). ' +
        'Connections may fail on restrictive NATs.'
    );
  }

  cachedServers = servers;
  cacheExpiresAt = now + 60 * 60 * 1000;
  return servers;
}

/** Test helper — clear cached ICE servers */
export function clearIceServerCache(): void {
  cachedServers = null;
  cacheExpiresAt = 0;
}
