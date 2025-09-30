// Navigation Imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Component Imports
import AppStack from './AppStack';
import AuthStack from './AuthStack';

// Create native stack navigator
const Stack = createNativeStackNavigator();

const RootNavigator = ({ user }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <Stack.Screen name="App" component={AppStack} />
            ) : (
                <Stack.Screen name="Auth" component={AuthStack} />
            )}
        </Stack.Navigator>
    )
}

export default RootNavigator