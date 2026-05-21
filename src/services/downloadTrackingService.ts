import { db } from '../firebase/config';
import { doc, increment, getDoc, setDoc, collection, query, orderBy, limit as firestoreLimit, getDocs } from 'firebase/firestore';

export interface DownloadStats {
  totalDownloads: number;
  lastDownloaded?: Date;
  downloadsByDate: { [date: string]: number };
}

export interface DownloadEvent {
  id: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

class DownloadTrackingService {
  private readonly statsDocRef = doc(db, 'analytics', 'pdfDownloads');
  private readonly eventsCollectionRef = collection(db, 'analytics', 'pdfDownloads', 'events');

  async trackDownload(): Promise<void> {
    try {
      // Increment total downloads
      await setDoc(this.statsDocRef, {
        totalDownloads: increment(1),
        lastDownloaded: new Date(),
        [`downloadsByDate.${this.getDateKey()}`]: increment(1)
      }, { merge: true });

      // Record individual download event
      await setDoc(doc(this.eventsCollectionRef), {
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        // Note: IP address would need to be captured server-side for privacy
      });
    } catch (error) {
      console.error('Error tracking download:', error);
      // Don't throw - we don't want to break the download if tracking fails
    }
  }

  async getDownloadStats(): Promise<DownloadStats> {
    try {
      const docSnap = await getDoc(this.statsDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          totalDownloads: data.totalDownloads || 0,
          lastDownloaded: data.lastDownloaded?.toDate(),
          downloadsByDate: data.downloadsByDate || {}
        };
      }
      return {
        totalDownloads: 0,
        downloadsByDate: {}
      };
    } catch (error) {
      console.error('Error getting download stats:', error);
      return {
        totalDownloads: 0,
        downloadsByDate: {}
      };
    }
  }

  async getRecentDownloads(limitCount: number = 10): Promise<DownloadEvent[]> {
    try {
      const q = query(this.eventsCollectionRef, orderBy('timestamp', 'desc'), firestoreLimit(limitCount));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        timestamp: doc.data().timestamp.toDate(),
        userAgent: doc.data().userAgent
      }));
    } catch (error) {
      console.error('Error getting recent downloads:', error);
      return [];
    }
  }

  private getDateKey(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  async getDownloadsByDateRange(startDate: Date, endDate: Date): Promise<{ [date: string]: number }> {
    try {
      const docSnap = await getDoc(this.statsDocRef);
      if (!docSnap.exists()) {
        return {};
      }

      const data = docSnap.data();
      const downloadsByDate = data.downloadsByDate || {};
      const filtered: { [date: string]: number } = {};

      const startKey = startDate.toISOString().split('T')[0];
      const endKey = endDate.toISOString().split('T')[0];

      Object.entries(downloadsByDate).forEach(([date, count]) => {
        if (date >= startKey && date <= endKey) {
          filtered[date] = count as number;
        }
      });

      return filtered;
    } catch (error) {
      console.error('Error getting downloads by date range:', error);
      return {};
    }
  }
}

export const downloadTrackingService = new DownloadTrackingService();

