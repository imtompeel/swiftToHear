import { SuperadminService } from '../services/superadminService';

/**
 * Utility function to set up the first superadmin
 * This should be run once to create the initial superadmin user
 */
export const setupFirstSuperadmin = async (uid: string): Promise<void> => {
  try {
    console.log('Setting up first superadmin...');
    
    // Check if the user is already a superadmin
    const isAlreadySuperadmin = await SuperadminService.isSuperadmin({ uid } as any);
    
    if (isAlreadySuperadmin) {
      console.log('User is already a superadmin');
      return;
    }
    
    // Add the user as a superadmin
    await SuperadminService.addSuperadmin(uid);
    
    console.log(`Successfully set up superadmin: ${uid}`);
  } catch (error) {
    console.error('Error setting up superadmin:', error);
    throw error;
  }
};

/**
 * Utility function to list all superadmins
 */
export const listSuperadmins = async (): Promise<void> => {
  try {
    const superadmins = await SuperadminService.getAllSuperadmins();
    
    console.log('Current superadmins:');
    superadmins.forEach((superadmin, index) => {
      console.log(`${index + 1}. UID: ${superadmin.uid} - Created: ${superadmin.createdAt.toISOString()}`);
    });
  } catch (error) {
    console.error('Error listing superadmins:', error);
    throw error;
  }
};

/**
 * Utility function to remove a superadmin
 */
export const removeSuperadmin = async (uid: string): Promise<void> => {
  try {
    await SuperadminService.removeSuperadmin(uid);
    console.log(`Successfully removed superadmin with UID: ${uid}`);
  } catch (error) {
    console.error('Error removing superadmin:', error);
    throw error;
  }
};
