import { 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase/config';

export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role?: 'speaker' | 'listener' | 'scribe' | 'observer';
  isHost?: boolean;
}

class TestAuthService {
  private testUsers: TestUser[] = [
    {
      id: 'user-1',
      name: 'Alice Johnson',
      email: 'test@swifttohear.com',
      password: 'testpass123',
      role: 'speaker',
      isHost: true
    },
    {
      id: 'user-2', 
      name: 'Bob Smith',
      email: 'test@swifttohear.com',
      password: 'testpass123',
      role: 'listener'
    },
    {
      id: 'user-3',
      name: 'Carol Davis',
      email: 'test@swifttohear.com', 
      password: 'testpass123',
      role: 'scribe'
    },
    {
      id: 'user-4',
      name: 'David Wilson',
      email: 'test@swifttohear.com',
      password: 'testpass123',
      role: 'observer'
    }
  ];

  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.authStateListeners.forEach(listener => listener(user));
    });
  }

  // Get all test users
  getTestUsers(): TestUser[] {
    return this.testUsers;
  }

  // Get current authenticated user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get current test user data
  getCurrentTestUser(): TestUser | null {
    if (!this.currentUser) return null;
    return this.testUsers.find(user => user.email === this.currentUser?.email) || null;
  }

  // Sign in as a test user
  async signInAsTestUser(testUserId: string): Promise<User> {
    const testUser = this.testUsers.find(user => user.id === testUserId);
    if (!testUser) {
      throw new Error(`Test user ${testUserId} not found`);
    }

    try {
      // Try to sign in with existing credentials
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        testUser.email, 
        testUser.password
      );
      
      console.log('🟢 TEST AUTH - Signed in as:', testUser.name, 'UID:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, try to create them
        console.log('🟡 TEST AUTH - Creating new test user:', testUser.name);
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            testUser.email,
            testUser.password
          );
          
          console.log('🟢 TEST AUTH - Created and signed in as:', testUser.name, 'UID:', userCredential.user.uid);
          return userCredential.user;
        } catch (createError: any) {
          console.log('🟡 TEST AUTH - Could not create user, using existing auth if available');
          // If we can't create the user, check if there's already an authenticated user
          if (this.currentUser) {
            console.log('🟢 TEST AUTH - Using existing authenticated user:', this.currentUser.uid);
            return this.currentUser;
          } else {
            throw new Error(`Could not create test user and no existing auth available. Please create a test user manually in Firebase Auth with email: ${testUser.email} and password: ${testUser.password}`);
          }
        }
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        // User exists but password is wrong
        console.log('🟡 TEST AUTH - User exists with different password for:', testUser.name);
        if (this.currentUser) {
          console.log('🟢 TEST AUTH - Using existing authenticated user:', this.currentUser.uid);
          return this.currentUser;
        } else {
          throw new Error(`User exists with different password. Please sign in manually with email: ${testUser.email} or create a new user with password: ${testUser.password}`);
        }
      } else {
        // For any other error
        console.log('🟡 TEST AUTH - Auth error for:', testUser.name, 'Error:', error.code);
        if (this.currentUser) {
          console.log('🟢 TEST AUTH - Using existing authenticated user:', this.currentUser.uid);
          return this.currentUser;
        } else {
          throw new Error(`Authentication failed. Please create a test user manually in Firebase Auth with email: ${testUser.email} and password: ${testUser.password}`);
        }
      }
    }
  }

  // Sign in anonymously (fallback)
  async signInAnonymously(): Promise<User> {
    const userCredential = await signInAnonymously(auth);
    console.log('🟢 TEST AUTH - Signed in anonymously, UID:', userCredential.user.uid);
    return userCredential.user;
  }

  // Sign out
  async signOut(): Promise<void> {
    await signOut(auth);
    console.log('🟢 TEST AUTH - Signed out');
  }

  // Clear all test users (for testing purposes)
  async clearTestUsers(): Promise<void> {
    console.log('🟡 TEST AUTH - Clearing test users...');
    // Note: This would require admin SDK in production
    // For now, just sign out current user
    if (this.currentUser) {
      await signOut(auth);
    }
  }

  // Add auth state listener
  onAuthStateChanged(listener: (user: User | null) => void): () => void {
    this.authStateListeners.push(listener);
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Get user UID
  getCurrentUserId(): string | null {
    return this.currentUser?.uid || null;
  }

  // Get user display name
  getCurrentUserName(): string | null {
    if (this.currentUser?.displayName) {
      return this.currentUser.displayName;
    }
    const testUser = this.getCurrentTestUser();
    return testUser?.name || null;
  }
}

// Export singleton instance
export const testAuthService = new TestAuthService();
export default testAuthService;
