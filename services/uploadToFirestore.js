// Firebase Imports
import { doc, collection, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
// Data Imports
import recipes from '../assets/data/recipes.json';

export const uploadRecipes = async () => {
  try {
    for (const recipe of recipes) {
      // Create a document for the recipe
      const recipeDocRef = doc(collection(db, 'recipes'));
      await setDoc(recipeDocRef, {
        title: recipe.title,
        image: recipe.image,
        caption: recipe.caption,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        userId: recipe.userId,
        likes: recipe.likes || 0,
        commentCount: recipe.commentCount || 0,  // <-- added
        avgRating: recipe.avgRating || 0,
        createdAt: serverTimestamp(),
      });
      console.log('Uploaded recipe:', recipe.title);

      // Create an empty comments subcollection (optional)
      const commentsCollectionRef = collection(recipeDocRef, 'comments');
      // You can leave it empty or add an initial comment if needed
    }
    console.log('All recipes uploaded!');
  } catch (err) {
    console.error('Error uploading recipes to firestore:', err.message);
  }
};
