// Import global css for nativewind
import './global.css';
// React Imports
import { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
// Navigation Imports
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
// Firebase Imports
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
// Component Imports
import RootNavigator from './navigation/RootNavigator';
// Contexts Imports
import { RecipesProvider } from './contexts/RecipesContext';
import { UserProvider } from './contexts/UserContext';
// Font Imports
import { useFonts } from 'expo-font';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold
} from '@expo-google-fonts/roboto';
import {
  Agbalumo_400Regular
} from '@expo-google-fonts/agbalumo';

// Custom theme
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F4F1F2'
  }
}

const App = () => {
  // States for user and loading status
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load fonts with useFonts
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
    Agbalumo_400Regular
  });

  // Listen for changes in firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [])

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <UserProvider>
      <RecipesProvider>
        <NavigationContainer theme={MyTheme}>
          <RootNavigator user={user} />
        </NavigationContainer>
      </RecipesProvider>
    </UserProvider>
  );
}

export default App;