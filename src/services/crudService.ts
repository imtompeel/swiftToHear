import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  getDocs,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface CrudServiceConfig<T extends DocumentData> {
  collectionName: string;
  idField?: keyof T;
  timestampFields?: (keyof T)[];
}

export class CrudService<T extends DocumentData> {
  private collectionName: string;
  private idField: keyof T;
  private timestampFields: (keyof T)[];

  constructor(config: CrudServiceConfig<T>) {
    this.collectionName = config.collectionName;
    this.idField = config.idField || 'id' as keyof T;
    this.timestampFields = config.timestampFields || [];
  }

  // Create a new document
  async create(data: Omit<T, 'id' | 'createdAt'>, id?: string): Promise<T> {
    try {
      const docId = id || this.generateId();
      const timestamp = serverTimestamp() as Timestamp;
      
      const documentData = {
        ...data,
        [this.idField]: docId,
        createdAt: timestamp,
      } as unknown as T;

      // Add timestamps to specified fields
      this.timestampFields.forEach(field => {
        (documentData as any)[field] = timestamp;
      });

      await setDoc(doc(db, this.collectionName, docId), documentData);
      return documentData;
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get a document by ID
  async get(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update a document
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      // Add updatedAt timestamp if specified
      const updateData: any = { ...data };
      if (this.timestampFields.includes('updatedAt' as keyof T)) {
        updateData.updatedAt = serverTimestamp();
      }

      await updateDoc(docRef, updateData);
      
      // Return the updated document
      return await this.get(id);
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error(`Error deleting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Query documents with filters
  async query(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data() as T);
    } catch (error) {
      console.error(`Error querying documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Listen to a document in real-time
  listenToDocument(id: string, callback: (document: T | null) => void): () => void {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          callback(doc.data() as T);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error(`Error listening to document in ${this.collectionName}:`, error);
        callback(null);
      });

      return unsubscribe;
    } catch (error) {
      console.error(`Error setting up document listener for ${this.collectionName}:`, error);
      return () => {}; // Return empty function if setup fails
    }
  }

  // Listen to a collection query in real-time
  listenToQuery(
    constraints: QueryConstraint[] = [], 
    callback: (documents: T[]) => void
  ): () => void {
    try {
      const q = query(collection(db, this.collectionName), ...constraints);
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => doc.data() as T);
        callback(documents);
      }, (error) => {
        console.error(`Error listening to query in ${this.collectionName}:`, error);
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error(`Error setting up query listener for ${this.collectionName}:`, error);
      return () => {}; // Return empty function if setup fails
    }
  }

  // Batch operations
  async batchCreate(documents: Omit<T, 'id' | 'createdAt'>[]): Promise<T[]> {
    try {
      const createdDocuments: T[] = [];
      
      for (const doc of documents) {
        const created = await this.create(doc);
        createdDocuments.push(created);
      }
      
      return createdDocuments;
    } catch (error) {
      console.error(`Error batch creating documents in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async batchUpdate(updates: { id: string; data: Partial<T> }[]): Promise<(T | null)[]> {
    try {
      const updatedDocuments: (T | null)[] = [];
      
      for (const update of updates) {
        const updated = await this.update(update.id, update.data);
        updatedDocuments.push(updated);
      }
      
      return updatedDocuments;
    } catch (error) {
      console.error(`Error batch updating documents in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async batchDelete(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await this.delete(id);
      }
    } catch (error) {
      console.error(`Error batch deleting documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Utility methods
  private generateId(): string {
    return `${this.collectionName}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get collection reference
  getCollectionRef() {
    return collection(db, this.collectionName);
  }

  // Get document reference
  getDocumentRef(id: string) {
    return doc(db, this.collectionName, id);
  }
}
