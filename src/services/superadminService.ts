import { User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface SuperadminUser {
  uid: string;
  email: string;
  isSuperadmin: boolean;
  createdAt?: Date;
}

export interface SuperadminRecord {
  uid: string;
  createdAt: Date;
  isActive: boolean;
}

export class SuperadminService {
  private static COLLECTION_NAME = 'superadmins';

  /**
   * Check if the current user is a superadmin by querying the superadmin collection
   */
  static async isSuperadmin(user: User | null): Promise<boolean> {
    if (!user || !user.uid) {
      console.log('No user or UID provided for superadmin check');
      return false;
    }
    
    try {
      console.log(`Checking superadmin status for UID: ${user.uid}`);
      const superadminDoc = await getDoc(doc(db, this.COLLECTION_NAME, user.uid));
      
      if (!superadminDoc.exists()) {
        console.log(`Superadmin document not found for UID: ${user.uid}`);
        return false;
      }
      
      const data = superadminDoc.data();
      const isActive = data?.isActive !== false;
      
      console.log(`Superadmin status for UID ${user.uid}:`, {
        exists: superadminDoc.exists(),
        isActive,
        data
      });
      
      return isActive;
    } catch (error: any) {
      console.error('Error checking superadmin status:', error);
      
      // Re-throw specific errors for better handling
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied: Firestore rules may not be properly configured');
      } else if (error.code === 'not-found') {
        throw new Error('Superadmin collection not found');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore service unavailable');
      } else {
        throw new Error(`Superadmin check failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Get superadmin user info
   */
  static async getSuperadminUser(user: User | null): Promise<SuperadminUser | null> {
    if (!user) {
      return null;
    }

    const isSuperadmin = await this.isSuperadmin(user);
    
    return {
      uid: user.uid,
      email: user.email || '',
      isSuperadmin
    };
  }

  /**
   * Require superadmin access - throws error if user is not superadmin
   */
  static async requireSuperadmin(user: User | null): Promise<SuperadminUser> {
    const superadminUser = await this.getSuperadminUser(user);
    
    if (!superadminUser || !superadminUser.isSuperadmin) {
      throw new Error('Superadmin access required');
    }
    
    return superadminUser;
  }

  /**
   * Add a user as superadmin
   */
  static async addSuperadmin(uid: string): Promise<void> {
    try {
      const superadminRecord: SuperadminRecord = {
        uid,
        createdAt: new Date(),
        isActive: true
      };

      await setDoc(doc(db, this.COLLECTION_NAME, uid), superadminRecord);
      console.log(`Superadmin added: ${uid}`);
    } catch (error) {
      console.error('Error adding superadmin:', error);
      throw new Error('Failed to add superadmin');
    }
  }

  /**
   * Remove a user's superadmin privileges
   */
  static async removeSuperadmin(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, uid));
      console.log(`Superadmin removed: ${uid}`);
    } catch (error) {
      console.error('Error removing superadmin:', error);
      throw new Error('Failed to remove superadmin');
    }
  }

  /**
   * Get all superadmins
   */
  static async getAllSuperadmins(): Promise<SuperadminRecord[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const superadmins: SuperadminRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        superadmins.push({
          uid: data.uid,
          createdAt: data.createdAt.toDate(),
          isActive: data.isActive
        });
      });
      
      return superadmins;
    } catch (error) {
      console.error('Error getting superadmins:', error);
      throw new Error('Failed to get superadmins');
    }
  }


}
