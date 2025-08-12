import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';

export class PeriodicCleanupService {
  private static readonly CLEANUP_INTERVALS = {
    SIGNALING_MESSAGES: 24 * 60 * 60 * 1000, // 24 hours
    OLD_SESSIONS: 7 * 24 * 60 * 60 * 1000,   // 7 days
    TEST_DATA: 24 * 60 * 60 * 1000           // 24 hours
  };

  // Clean up expired signaling messages
  static async cleanupExpiredSignalingMessages(): Promise<number> {
    try {
      const cutoffTime = new Timestamp(
        Math.floor((Date.now() - this.CLEANUP_INTERVALS.SIGNALING_MESSAGES) / 1000),
        0
      );

      const signalingQuery = query(
        collection(db, 'signaling'),
        where('expiresAt', '<', cutoffTime),
        orderBy('expiresAt', 'desc'),
        limit(100) // Process in batches
      );

      const querySnapshot = await getDocs(signalingQuery);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
      
      console.log(`🧹 Periodic cleanup: Removed ${querySnapshot.docs.length} expired signaling messages`);
      return querySnapshot.docs.length;
    } catch (error) {
      console.error('❌ Error during signaling messages cleanup:', error);
      return 0;
    }
  }

  // Clean up old completed sessions
  static async cleanupOldCompletedSessions(): Promise<number> {
    try {
      const cutoffTime = new Timestamp(
        Math.floor((Date.now() - this.CLEANUP_INTERVALS.OLD_SESSIONS) / 1000),
        0
      );

      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('status', '==', 'completed'),
        where('createdAt', '<', cutoffTime),
        orderBy('createdAt', 'desc'),
        limit(50) // Process in batches
      );

      const querySnapshot = await getDocs(sessionsQuery);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
      
      console.log(`🧹 Periodic cleanup: Removed ${querySnapshot.docs.length} old completed sessions`);
      return querySnapshot.docs.length;
    } catch (error) {
      console.error('❌ Error during old sessions cleanup:', error);
      return 0;
    }
  }

  // Clean up old group sessions
  static async cleanupOldCompletedGroupSessions(): Promise<number> {
    try {
      const cutoffTime = new Timestamp(
        Math.floor((Date.now() - this.CLEANUP_INTERVALS.OLD_SESSIONS) / 1000),
        0
      );

      const groupSessionsQuery = query(
        collection(db, 'groupSessions'),
        where('status', '==', 'completed'),
        where('createdAt', '<', cutoffTime),
        orderBy('createdAt', 'desc'),
        limit(50) // Process in batches
      );

      const querySnapshot = await getDocs(groupSessionsQuery);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
      
      console.log(`🧹 Periodic cleanup: Removed ${querySnapshot.docs.length} old completed group sessions`);
      return querySnapshot.docs.length;
    } catch (error) {
      console.error('❌ Error during old group sessions cleanup:', error);
      return 0;
    }
  }

  // Clean up test data
  static async cleanupTestData(): Promise<number> {
    try {
      const cutoffTime = new Timestamp(
        Math.floor((Date.now() - this.CLEANUP_INTERVALS.TEST_DATA) / 1000),
        0
      );

      const testQuery = query(
        collection(db, 'test'),
        where('createdAt', '<', cutoffTime),
        orderBy('createdAt', 'desc'),
        limit(100) // Process in batches
      );

      const querySnapshot = await getDocs(testQuery);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
      
      console.log(`🧹 Periodic cleanup: Removed ${querySnapshot.docs.length} old test documents`);
      return querySnapshot.docs.length;
    } catch (error) {
      console.error('❌ Error during test data cleanup:', error);
      return 0;
    }
  }

  // Run all cleanup operations
  static async runFullCleanup(): Promise<{
    signalingMessages: number;
    oldSessions: number;
    oldGroupSessions: number;
    testData: number;
  }> {
    console.log('🧹 Starting periodic cleanup service...');
    
    const results = {
      signalingMessages: 0,
      oldSessions: 0,
      oldGroupSessions: 0,
      testData: 0
    };

    try {
      // Run all cleanup operations in parallel
      const [
        signalingCount,
        sessionsCount,
        groupSessionsCount,
        testDataCount
      ] = await Promise.all([
        this.cleanupExpiredSignalingMessages(),
        this.cleanupOldCompletedSessions(),
        this.cleanupOldCompletedGroupSessions(),
        this.cleanupTestData()
      ]);

      results.signalingMessages = signalingCount;
      results.oldSessions = sessionsCount;
      results.oldGroupSessions = groupSessionsCount;
      results.testData = testDataCount;

      console.log('✅ Periodic cleanup completed:', results);
    } catch (error) {
      console.error('❌ Error during full cleanup:', error);
    }

    return results;
  }

  // Get cleanup statistics
  static async getCleanupStats(): Promise<{
    totalSignalingMessages: number;
    totalCompletedSessions: number;
    totalCompletedGroupSessions: number;
    totalTestDocuments: number;
  }> {
    try {
      const [
        signalingSnapshot,
        sessionsSnapshot,
        groupSessionsSnapshot,
        testSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'signaling')),
        getDocs(query(collection(db, 'sessions'), where('status', '==', 'completed'))),
        getDocs(query(collection(db, 'groupSessions'), where('status', '==', 'completed'))),
        getDocs(collection(db, 'test'))
      ]);

      return {
        totalSignalingMessages: signalingSnapshot.docs.length,
        totalCompletedSessions: sessionsSnapshot.docs.length,
        totalCompletedGroupSessions: groupSessionsSnapshot.docs.length,
        totalTestDocuments: testSnapshot.docs.length
      };
    } catch (error) {
      console.error('❌ Error getting cleanup stats:', error);
      return {
        totalSignalingMessages: 0,
        totalCompletedSessions: 0,
        totalCompletedGroupSessions: 0,
        totalTestDocuments: 0
      };
    }
  }
}
