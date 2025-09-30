// React Imports
import React, { createContext, useState, useEffect, Alert } from 'react';
// Services Imports
import { getFirestoreRecipesPaginated, getAPIRecipes } from '../services/recipeServices';
import { getUserLikes, toggleLikeService } from '../services/likesServices';
// Firebase Imports
import { auth } from '../firebaseConfig';

export const RecipesContext = createContext();

export const RecipesProvider = ({ children }) => {
    const uid = auth.currentUser?.uid;

    const [recipes, setRecipes] = useState([]);
    const [userLikes, setUserLikes] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMoreFirestore, setHasMoreFirestore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreAPI, setHasMoreAPI] = useState(true);

    const pageSize = 10;

    // Get user liked recipes
    useEffect(() => {
        const fetchUserLikes = async () => {
            const likedIds = await getUserLikes(uid);
            setUserLikes(likedIds);
        }
        fetchUserLikes();
    }, [uid])

    // Fetch initial recipes
    useEffect(() => {
        const fetchInitial = async () => {
            if (!uid) return;
            setLoading(true);

            // Load recipes according to selectedFilter
            const { recipes: initialRecipes, lastDoc: newLastDoc } = await getFirestoreRecipesPaginated(selectedFilter, pageSize);
            setRecipes(initialRecipes);
            setLastDoc(newLastDoc);
            setHasMoreFirestore(initialRecipes.length === pageSize);
            setLoading(false);
        };

        fetchInitial();
    }, [uid, selectedFilter]);

    // Refresh recipes
    const refreshRecipes = async () => {
        setLoading(true);
        // Fetch first page of Firestore recipes again
        const { recipes: initialRecipes, lastDoc: newLastDoc } = await getFirestoreRecipesPaginated(selectedFilter, pageSize);
        setRecipes(initialRecipes);
        setLastDoc(newLastDoc);
        setHasMoreFirestore(initialRecipes.length === pageSize);
        setLoading(false);
    };

    // Load more recipes
    const loadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        // First try firestore
        if (hasMoreFirestore) {
            const { recipes: newRecipes, lastDoc: newLastDoc } = await getFirestoreRecipesPaginated(selectedFilter, pageSize, lastDoc);
            setRecipes((prev) => [...prev, ...newRecipes]);
            setLastDoc(newLastDoc);
            setHasMoreFirestore(newRecipes.length === pageSize);
            setLoadingMore(false);
            return;
        }

        // Fallback to API recipes
        if (hasMoreAPI) {
            const apiRecipes = await getAPIRecipes(pageSize);
            setRecipes((prev) => {
                const existingIds = new Set(prev.map(r => r.id));
                // Filter out duplicates both against existing recipes and within the new batch
                const uniqueApiRecipes = apiRecipes.filter((r, idx, arr) =>
                    !existingIds.has(r.id) && arr.findIndex(a => a.id === r.id) === idx
                );
                return [...prev, ...uniqueApiRecipes];
            });
            setLoadingMore(false);
        }
    };

    /**
     * Toggle like for recipe 
     * @param {*} recipeId 
     * @param {*} source 
     */
    const toggleLike = async (recipeId, source = 'firestore') => {
        const isLiked = userLikes.includes(recipeId);

        // Optimistic UI: update likes count for firestore recipes only
        setRecipes(prev =>
            prev.map(r =>
                r.id === recipeId && source === 'firestore'
                    ? { ...r, likes: isLiked ? r.likes - 1 : r.likes + 1 }
                    : r
            )
        );

        // Update user likes in context
        setUserLikes(prev =>
            isLiked ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
        );

        try { // Toggle likes in firestore (or not depending on source)
            await toggleLikeService(uid, recipeId, isLiked, source);
        } catch (err) {
            console.error('Failed to toggle like', err);
            // Optional: rollback optimistic update
        }
    };

    return (
        <RecipesContext.Provider value={{
            recipes,
            setRecipes,
            selectedFilter,
            setSelectedFilter,
            userLikes,
            loading,
            loadMore,
            loadingMore,
            hasMoreFirestore,
            toggleLike,
            refreshRecipes
        }}>
            {children}
        </RecipesContext.Provider>
    );
};