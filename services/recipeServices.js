// Firebase Imports
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { doc, getDoc, collection, getDocs, orderBy, query, limit, startAfter, serverTimestamp, addDoc, where } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
// Services Imports
import { getFirestoreUser } from './userServices';
import { compressImage } from './imageServices';

// API URL
const API_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';

/**
 * Get paginated recipes from firestore with optional filtering
 * @params filter - 'all', 'recently uploaded', 'most popular', 'top rated'
 * @params pageSize - how many recipes to fetch per page
 * @params lastDoc - cursor for pagination (from previous query)
 * @returns recipes[], lastDoc
 */
export const getFirestoreRecipesPaginated = async (filter = 'all', pageSize = 10, lastDoc = null) => {
    try {
        let q;

        // Base collection
        let baseQuery = collection(db, 'recipes');

        // Adjust query based on filter
        switch (filter) {
            case 'recently uploaded':
                q = query(baseQuery, orderBy('createdAt', 'desc'), limit(pageSize));
                break;
            case 'most popular':
                q = query(baseQuery, orderBy('likes', 'desc'), limit(pageSize));
                break;
            case 'top rated':
                q = query(baseQuery, orderBy('avgRating', 'desc'), limit(pageSize));
                break;
            case 'all':
            default:
                q = query(baseQuery, limit(pageSize));
                break;
        }

        // Apply cursor if provided
        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        // Fetch recipes
        const querySnapshot = await getDocs(q);

        const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

        // Format recipes with user data (username & profile picture link)
        const recipes = await Promise.all(
            querySnapshot.docs.map(async (docSnap) => {
                const recipe = { id: docSnap.id, ...docSnap.data() };
                const userData = await getFirestoreUser(recipe.userId);
                return {
                    ...recipe,
                    username: userData?.username || 'No username',
                    profilePicture: userData?.profilePicture || null,
                    source: 'firestore'
                };
            })
        );

        return { recipes, lastDoc: newLastDoc };
    } catch (err) {
        console.error('getFirestoreRecipes: ', err.message);
        return { recipes: [], lastDoc: null };
    }
};

/**
 * Map API recipe
 * @param {*} meal 
 * @returns recipe with same structure as firestore
 */
export const mapAPIRecipe = (meal) => {
    // Extract ingredients + measures
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`]?.trim();
        const measure = meal[`strMeasure${i}`]?.trim();
        if (ingredient && ingredient !== '') {
            ingredients.push({
                item: ingredient,
                serving: measure || '',
            });
        }
    }

    return {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        createdAt: new Date(0), // placeholder
        likes: 0,
        username: 'TheMealDB',
        profilePicture: 'https://www.themealdb.com/images/logo-small.png',
        source: 'api',
        steps: meal.strInstructions || '',
        ingredients,
    };
};


/**
 * Fetch random recipes from TheMealDB API
 * @param count - number of recipes to fetch
 * @returns recipes
 */
export const getAPIRecipes = async (count = 10) => {
    try {
        // Create array of fetch promises
        const requests = Array.from({ length: count }, () => fetch(API_URL));

        // Execute all requests in parallel
        const responses = await Promise.all(requests);
        const jsonData = await Promise.all(responses.map((res) => res.json()));

        // Map into recipe objects
        const meals = jsonData
            .map((data) => data.meals?.[0])
            .filter(Boolean)
            .map(mapAPIRecipe);

        return meals;
    } catch (err) {
        console.error('Error fetching random meals from API:', err.message);
        return [];
    }
}

/**
 * Upload a recipe to Firestore
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.caption
 * @param {Array} params.ingredients
 * @param {string} params.steps
 * @param {string} params.imageUri
 */
export const uploadRecipe = async ({ uid, title, caption, ingredients, steps, imageUri }) => {
    // Compress image
    const compressedUri = await compressImage(imageUri);
    const response = await fetch(compressedUri);
    const blob = await response.blob();

    const imageRef = ref(storage, `recipes/${Date.now()}_${uid}.jpg`);
    await uploadBytes(imageRef, blob);
    const imageUrl = await getDownloadURL(imageRef);

    // Prepare recipe doc
    const recipeData = {
        title: title.trim(),
        caption: caption.trim(),
        ingredients: ingredients.map(i => ({ item: i.item, serving: i.serving })),
        steps: steps.trim(),
        image: imageUrl,
        userId: uid,
        createdAt: serverTimestamp(),
        likes: 0,
        avgRating: 0,
        comments: []
    };

    await addDoc(collection(db, 'recipes'), recipeData);
    return recipeData;
};

/**
 * Firestore search
 * @param {*} searchTerm 
 * @returns 
 */
export const searchFirestoreRecipes = async (searchTerm) => {
    try {
        const recipesRef = collection(db, "recipes");
        const q = query(
            recipesRef,
            where("title", ">=", searchTerm),
            where("title", "<=", searchTerm + "\uf8ff")
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            source: "firestore",
        }));
    } catch (error) {
        console.error("Error searching Firestore:", error);
        return [];
    }
};

/**
 * Search RecipesContext recipes
 * @param {*} recipes 
 * @param {*} searchTerm 
 * @returns 
 */
export const searchContextRecipes = (recipes, searchTerm) => {
    return recipes
        .filter((r) =>
            r.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((r) => ({ ...r, source: r.source || "context" }));
};

/**
 * Search API 
 * @param {*} searchTerm 
 * @returns 
 */
export const searchApiRecipes = async (searchTerm) => {
    try {
        const res = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
        );
        const data = await res.json();

        if (!data.meals) return [];

        // Map into recipe objects using your utility
        return data.meals.map((meal) => mapAPIRecipe(meal));
    } catch (error) {
        console.error("Error searching API:", error);
        return [];
    }
};

/**
 * Search wrapper
 * @param {*} searchTerm 
 * @param {*} contextRecipes 
 * @returns 
 */
export const searchRecipes = async (searchTerm, contextRecipes) => {
    if (!searchTerm.trim()) return [];

    // Firestore first
    const firestoreResults = await searchFirestoreRecipes(searchTerm);
    if (firestoreResults.length > 0) return firestoreResults;

    // Context next
    const contextResults = searchContextRecipes(contextRecipes, searchTerm);
    if (contextResults.length > 0) return contextResults;

    // API last
    const apiResults = await searchApiRecipes(searchTerm);
    return apiResults;
};

/**
 * Get recipes by user id
 * @param {*} uid 
 * @returns recipes
 */
export const getRecipesForUser = async (uid) => {
    try {
        const q = query(
            collection(db, "recipes"),
            where("userId", "==", uid)
        );
        const querySnapshot = await getDocs(q);

        const recipes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return recipes;
    } catch (err) {
        console.error("Error fetching recipes for user:", err.message);
        return [];
    }
}

/**
 * Get recipes by id from firestore & api
 * @param {*} recipeIds 
 * @returns recipes
 */
export const getRecipesById = async (recipeIds) => {
    if (!recipeIds || recipeIds.length === 0) return [];

    const recipesRef = collection(db, "recipes");
    let results = [];

    // Firestore only allows 10 IDs per "in" query
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < recipeIds.length; i += chunkSize) {
        chunks.push(recipeIds.slice(i, i + chunkSize));
    }

    // Fetch from Firestore in chunks
    for (const chunk of chunks) {
        const q = query(recipesRef, where("__name__", "in", chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach((docSnap) => {
            results.push({ id: docSnap.id, ...docSnap.data() });
        });
    }

    // Find IDs missing from Firestore
    const foundIds = new Set(results.map((r) => r.id));
    const missingIds = recipeIds.filter((id) => !foundIds.has(id));

    // Fetch missing ones from API
    for (const id of missingIds) {
        try {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const data = await res.json();

            if (data.meals && data.meals.length > 0) {
                results.push(mapAPIRecipe(data.meals[0]));
            }
        } catch (err) {
            console.error("Error fetching from API:", err);
        }
    }

    // Optional: preserve input order
    return recipeIds.map((id) => results.find((r) => r.id === id)).filter(Boolean);
};