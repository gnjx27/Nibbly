// Firebase Imports
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig';

/**
 * Get user data from firestore by id
 * @param {*} uid 
 * @returns user data
 */
export const getFirestoreUser = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (err) {
        console.error('getFirestoreUser: ', err.message);
        return null;
    }
}