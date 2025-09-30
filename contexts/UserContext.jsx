// React Imports
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
// Firebase Imports
import { auth, db, storage } from '../firebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// Expo Imports
import * as ImagePicker from 'expo-image-picker';

// Create context
export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
    const uid = auth.currentUser?.uid;
    const [contextUser, setContextUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false); // for username/profile updates

    useEffect(() => {
        if (!uid) return;

        const userRef = doc(db, 'users', uid);
        // Real-time listener
        const unsubscribe = onSnapshot(
            userRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setContextUser({ id: uid, ...docSnap.data() });
                }
                setLoading(false);
            },
            (error) => {
                console.error('User snapshot error:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [uid]);

    // Update username
    const updateUsername = async (newUsername) => {
        if (!uid) return;
        if (!newUsername.trim()) {
            Alert.alert('Error', 'Please enter a valid username.');
            return;
        }
        setUpdating(true);
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { username: newUsername.trim() });
            Alert.alert('Success', 'Username updated.');
        } catch (error) {
            console.error('Error updating username:', error);
            Alert.alert('Error', 'Failed to update username.');
        } finally {
            setUpdating(false);
        }
    };

    const updateProfilePicture = async (imageUri) => {
        if (!uid) return;
        setUpdating(true);
        try {
            let uri = imageUri;

            // If no URI provided, open image picker
            if (!uri) {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                });

                if (result.canceled) return; // user cancelled
                uri = result.assets[0].uri;
            }

            // Upload to Firebase Storage
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `profilePictures/${uid}.jpg`);
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            // Update Firestore
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { profilePicture: downloadURL });

            // Optionally update context immediately
            setContextUser(prev => ({ ...prev, profilePicture: downloadURL }));
            Alert.alert('Success', 'Profile picture updated.');
        } catch (error) {
            console.error('Error updating profile picture:', error);
            Alert.alert('Error', 'Failed to update profile picture.');
        } finally {
            setUpdating(false);
        }
    };

    // Update bio
    const updateBio = async (newBio) => {
        if (!uid) return;
        setUpdating(true);
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { bio: newBio });
            // Update context immediately
            setContextUser(prev => ({ ...prev, bio: newBio }));
            Alert.alert('Success', 'Bio updated.');
        } catch (error) {
            console.error('Error updating bio:', error);
            Alert.alert('Error', 'Failed to update bio.');
        } finally {
            setUpdating(false);
        }
    };


    return (
        <UserContext.Provider value={{ contextUser, setContextUser, loading, updating, updateUsername, updateProfilePicture, updateBio }}>
            {children}
        </UserContext.Provider>
    );
};
