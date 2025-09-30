// Imports
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, inMemoryPersistence} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Environment variables for Firebase configuration
import { 
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID
} from '@env';

// Firebase configuration
const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Detect if AsyncStorage is available (Expo Snack might not have it)
let persistence;
try {
    persistence = getReactNativePersistence(AsyncStorage);
} catch (err) {
    console.warn('AsyncStorage not available, using in-memory auth persistence for Snack.');
    persistence = inMemoryPersistence;
}

// Initialize Auth
const auth = initializeAuth(app, { persistence });

// Firebase storage
const storage = getStorage(app);

// Initialize firestore
const db = getFirestore(app);

export { auth, db, storage };
