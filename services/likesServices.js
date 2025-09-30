// Firebase Imports
import { db } from '../firebaseConfig';
import { doc, setDoc, deleteDoc, collection, getDocs, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

/**
 * Get user liked recipes ids from firestore
 * @param {*} uid 
 * @returns Liked recipe ids
 */
export const getUserLikes = async (uid) => {
    const likesCol = collection(db, "users", uid, "likes");
    const likesSnap = await getDocs(likesCol);
    return likesSnap.docs.map(doc => doc.id);
}

/**
 * Toggle user liked recipes & recipes likes count in firestore
 * @param {*} uid 
 * @param {*} recipeId 
 * @param {*} isLiked 
 */
export const toggleLikeService = async (uid, recipeId, isLiked, source = 'firestore') => {
    const likeRef = doc(db, "users", uid, "likes", recipeId);
    if (isLiked) {
        // Remove like
        await deleteDoc(likeRef);
        if (source === 'firestore') {
            const recipeRef = doc(db, "recipes", recipeId);
            await updateDoc(recipeRef, { likes: increment(-1) });
        }
    } else {
        // Add like
        const likeData = { likedAt: serverTimestamp() };
        if (source === 'api') likeData.source = 'api';
        await setDoc(likeRef, likeData);

        if (source === 'firestore') {
            const recipeRef = doc(db, "recipes", recipeId);
            await updateDoc(recipeRef, { likes: increment(1) });
        }
    }
};
