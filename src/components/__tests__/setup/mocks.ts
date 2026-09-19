import { vi } from 'vitest';

// ===== DAILY PREBUILT MOCKS =====

export const mockDailyFrame = {
  join: vi.fn(),
  leave: vi.fn(),
  participants: vi.fn(() => ({})),
  on: vi.fn(),
  off: vi.fn(),
  updateParticipant: vi.fn(),
  createBreakoutRoom: vi.fn(),
  destroy: vi.fn()
};

export const mockDailyCall = {
  createFrame: vi.fn(() => mockDailyFrame),
  createCallObject: vi.fn(() => mockDailyFrame)
};

// Daily Prebuilt module mock
vi.mock('@daily-co/daily-js', () => ({
  default: mockDailyCall
}));

// ===== FIREBASE MOCKS =====

const mockAuthUser = {
  uid: 'test-user',
  email: 'test@example.com',
  displayName: 'Test User',
};

export const mockFirestoreDb = { _type: 'firestore' };

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'test-app' })),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: mockAuthUser })),
  onAuthStateChanged: vi.fn((_auth: unknown, callback: (user: typeof mockAuthUser) => void) => {
    callback(mockAuthUser);
    return vi.fn();
  }),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: mockAuthUser })),
  signOut: vi.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: mockAuthUser })),
  updateProfile: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockFirestoreDb),
  collection: vi.fn((_db: unknown, path: string) => ({ path })),
  doc: vi.fn(() => ({ path: 'mock-doc' })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => undefined })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [], empty: true, forEach: vi.fn() })),
  onSnapshot: vi.fn(() => vi.fn()),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  increment: vi.fn(),
  serverTimestamp: vi.fn(() => ({ seconds: 0, nanoseconds: 0 })),
  Timestamp: { now: vi.fn(() => ({ seconds: 0, nanoseconds: 0, toMillis: () => 0 })) },
  runTransaction: vi.fn(async (_db: unknown, fn: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      get: vi.fn(async () => ({ exists: () => false, data: () => undefined })),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    return fn(tx);
  }),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({ _type: 'storage' })),
  ref: vi.fn((_storage: unknown, path: string) => ({ fullPath: path, name: path.split('/').pop() })),
  listAll: vi.fn(async () => ({ items: [], prefixes: [] })),
  getDownloadURL: vi.fn(async () => 'https://example.com/demo.mp4'),
}));

export const mockFirebaseConfig = {
  db: mockFirestoreDb,
  auth: {
    currentUser: mockAuthUser,
    onAuthStateChanged: vi.fn((callback: (user: typeof mockAuthUser) => void) => {
      callback(mockAuthUser);
      return vi.fn();
    }),
  },
  analytics: {},
  storage: { _type: 'storage' },
  default: { name: 'test-app' },
};

vi.mock('../../../firebase/config', () => mockFirebaseConfig);

vi.mock('../../../components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: mockAuthUser,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    ensureSignedIn: vi.fn(async () => mockAuthUser),
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock('../../../components/VideoLobby', () => ({
  VideoLobby: () => null,
}));

const mockTestUsers = [
  { id: 'user-1', name: 'Alice', email: 'alice@test.com', role: 'host' },
  { id: 'user-2', name: 'Bob', email: 'bob@test.com', role: 'participant' },
  { id: 'user-3', name: 'Charlie', email: 'charlie@test.com', role: 'participant' },
  { id: 'user-4', name: 'Diana', email: 'diana@test.com', role: 'participant' },
];

const createTestAuthServiceMock = () => ({
  getTestUsers: vi.fn(() => mockTestUsers),
  getCurrentTestUser: vi.fn(() => mockTestUsers[0]),
  getCurrentUserId: vi.fn(() => 'user-1'),
  getCurrentUserName: vi.fn(() => 'Alice'),
  isAuthenticated: vi.fn(() => true),
  signInAsTestUser: vi.fn(() => Promise.resolve({ uid: 'user-1' })),
  authenticateTestUser: vi.fn(),
  onAuthStateChange: vi.fn(() => vi.fn()),
});

vi.mock('../../../services/testAuthService', () => {
  const testAuthService = createTestAuthServiceMock();
  return { testAuthService, default: testAuthService };
});

vi.mock('../../../hooks/useVideoCall', () => ({
  useVideoCall: () => ({
    isConnected: false,
    isConnecting: false,
    isMuted: false,
    isVideoEnabled: true,
    error: null,
    peerStreams: new Map(),
    connectionState: 'disconnected',
    localVideoRef: { current: null },
    localStreamRef: { current: null },
    toggleMute: vi.fn(),
    toggleVideo: vi.fn(),
    leaveCall: vi.fn(),
    reconnectCall: vi.fn(),
    updateParticipants: vi.fn(),
    getParticipantDisplayName: vi.fn(() => 'Unknown'),
    getParticipantRole: vi.fn(() => 'unknown'),
    peerCount: 0,
    hasError: false,
    canConnect: false,
  }),
}));

vi.mock('../../../services/firestoreSessionService', () => ({
  FirestoreSessionService: {
    getSession: vi.fn(() => Promise.resolve(null)),
    createSession: vi.fn(),
    updateSession: vi.fn(),
    joinSession: vi.fn(),
    deleteSession: vi.fn(),
  },
}));

// ===== WEBRTC MOCKS =====

export const mockWebRTC = {
  RTCPeerConnection: vi.fn(() => ({
    createOffer: vi.fn(),
    createAnswer: vi.fn(),
    setLocalDescription: vi.fn(),
    setRemoteDescription: vi.fn(),
    addIceCandidate: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })),
  getUserMedia: vi.fn(() => Promise.resolve({
    getTracks: () => [],
    getVideoTracks: () => [],
    getAudioTracks: () => []
  }))
};

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockWebRTC.getUserMedia,
    enumerateDevices: vi.fn(() => Promise.resolve([])),
    getDisplayMedia: vi.fn(() => Promise.resolve({}))
  },
  configurable: true
});

// ===== VIEWPORT MOCKS =====

export const mockViewport = {
  mobile: () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });
  },
  tablet: () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1024, configurable: true });
  },
  desktop: () => {
    Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });
  },
  reset: () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
  }
};

// ===== BROWSER MOCKS =====

export const mockBrowser = {
  chrome: () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true
    });
  },
  safari: () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      configurable: true
    });
  },
  firefox: () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      configurable: true
    });
  },
  unsupported: () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
      configurable: true
    });
  }
};

// ===== TEST DATA =====

export const mockParticipants = {
  threePerson: [
    { id: 'speaker', role: 'speaker', name: 'Alice' },
    { id: 'listener', role: 'listener', name: 'Bob' },
    { id: 'scribe', role: 'scribe', name: 'Charlie' }
  ],
  fourPerson: [
    { id: 'speaker', role: 'speaker', name: 'Alice' },
    { id: 'listener', role: 'listener', name: 'Bob' },
    { id: 'scribe', role: 'scribe', name: 'Charlie' },
    { id: 'observer', role: 'observer', name: 'Diana' }
  ],
  largeGroup: Array.from({ length: 12 }, (_, i) => ({
    id: `user-${i + 1}`,
    role: i < 3 ? ['speaker', 'listener', 'scribe'][i] : 'participant',
    name: `User ${i + 1}`
  }))
};

export const mockTopics = {
  personalGrowth: {
    category: 'Personal Growth & Relationships',
    theme: 'Current life transitions and changes',
    customPrompt: 'What changes are you navigating right now?'
  },
  workPurpose: {
    category: 'Work & Purpose',
    theme: 'Career direction and professional fulfilment',
    customPrompt: 'How do you find meaning in your daily work?'
  },
  wellbeing: {
    category: 'Well-being & Health',
    theme: 'Mental health and emotional patterns',
    customPrompt: 'What patterns do you notice in your emotional responses?'
  }
};

export const mockSessionConfig = {
  timePerRound: 8 * 60 * 1000, // 8 minutes
  totalRounds: 3,
  transitionTime: 30 * 1000, // 30 seconds
  reflectionTime: 5 * 60 * 1000, // 5 minutes
  // Duration options in milliseconds
  durationOptions: {
    short: 5 * 60 * 1000,      // 5 minutes
    medium: 10 * 60 * 1000,    // 10 minutes  
    default: 15 * 60 * 1000,   // 15 minutes
    long: 20 * 60 * 1000       // 20 minutes
  },
  defaultDuration: 15 * 60 * 1000, // 15 minutes
  minDuration: 3 * 60 * 1000,      // 3 minutes
  maxDuration: 60 * 60 * 1000      // 60 minutes
};

// Helper functions for duration calculations
export const durationHelpers = {
  getComfortPromptThreshold: (sessionDuration: number) => sessionDuration * 0.5, // 50% of session
  getPauseComfortThreshold: (sessionDuration: number) => sessionDuration * (7/15), // 7/15 of session (equivalent to old 420000/900000)
  formatDuration: (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },
  minutesToMs: (minutes: number) => minutes * 60 * 1000,
  msToMinutes: (milliseconds: number) => Math.floor(milliseconds / 60000)
};

// ===== UTILITY FUNCTIONS =====

export const createMockEvent = (participants: any) => ({
  participants: participants.reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {})
});

export const simulateNetworkConditions = {
  high: () => ({ bandwidth: 1000, latency: 20, packetLoss: 0 }),
  medium: () => ({ bandwidth: 500, latency: 100, packetLoss: 0.1 }),
  low: () => ({ bandwidth: 100, latency: 300, packetLoss: 0.5 })
};

// ===== CLEANUP UTILITIES =====

export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockViewport.reset();
  mockBrowser.chrome(); // Default to Chrome
};

export const advanceTimers = (time: number) => {
  vi.useFakeTimers();
  vi.advanceTimersByTime(time);
  vi.useRealTimers();
};