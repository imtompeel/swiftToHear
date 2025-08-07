import { db } from '../firebase/config';
import { collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore';

export interface EmailSignup {
  id?: string;
  email: string;
  involvementLevel: 'keep-updated' | 'get-involved';
  createdAt: Date;
  status?: 'pending' | 'confirmed' | 'unsubscribed';
}

// Add email to signup list
export const addEmailSignup = async (email: string, involvementLevel: 'keep-updated' | 'get-involved'): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'emailSignups'), {
      email: email.toLowerCase().trim(),
      involvementLevel,
      createdAt: new Date(),
      status: 'pending'
    });
    
    console.log('Email signup added with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding email signup:', error);
    throw new Error('Failed to save email signup');
  }
};

// Get all email signups (for admin)
export const getAllEmailSignups = async (): Promise<EmailSignup[]> => {
  try {
    const q = query(
      collection(db, 'emailSignups'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const signups: EmailSignup[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      signups.push({
        id: doc.id,
        email: data.email,
        involvementLevel: data.involvementLevel || 'keep-updated',
        createdAt: data.createdAt.toDate(),
        status: data.status
      });
    });
    
    return signups;
  } catch (error) {
    console.error('Error getting email signups:', error);
    throw new Error('Failed to fetch email signups');
  }
}; 