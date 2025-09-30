// Firebase Imports
import { query, orderBy, getDoc, getDocs, doc, collection, updateDoc, serverTimestamp, addDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Fetch comments for recipe with username and profile picture
 * @param {*} recipeId 
 * @returns 
 */
export const getComments = async (recipeId) => {
    const commentsColRef = collection(db, 'recipes', recipeId, 'comments');
    const q = query(commentsColRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const commentsData = await Promise.all(snapshot.docs.map(async docSnap => {
        const data = docSnap.data();
        // Fetch user info for each comment
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        const userData = userDoc.exists() ? userDoc.data() : {};
        return {
            id: docSnap.id,
            comment: data.comment,
            rating: data.rating,
            createdAt: data.createdAt,
            username: userData.username || 'Unknown',
            profilePicture: userData.profilePicture || '',
        };
    }));
    return commentsData;
}

/**
 * Upload comment to comments subcollection & increment commentCount for recipe in recipes collection
 * @param {*} recipeId 
 * @param {*} uid 
 * @param {*} comment 
 * @param {*} rating 
 */
export const uploadComment = async (recipeId, uid, comment, rating) => {
    // Ref to comments subcollection in recipes collection
    const commentRef = collection(db, 'recipes', recipeId, 'comments');
    // 1.  Add comment to subcollection
    const commentDoc = await addDoc(commentRef, {
        comment: comment,
        rating: rating, 
        userId: uid,
        createdAt: serverTimestamp()
    });
    // 2. Increment commentCount in the recipe document
    await updateDoc(doc(db, 'recipes', recipeId), {
        commentCount: increment(1)
    });
    // 3. Recalculate & update avgRating
    const snapshot = await getDocs(commentRef);
    const ratings = snapshot.docs.map(d => d.data().rating);
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    // 4. Update avgRating in recipe doc
    await updateDoc(doc(db, 'recipes', recipeId), { avgRating });
}