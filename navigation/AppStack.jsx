// Components Imports
import Home from "../components/Home"
import UploadRecipe from "../components/UploadRecipe";
import Recipe from "../components/Recipe";
import Explore from "../components/Explore";
import Profile from "../components/Profile";
import Settings from '../components/Settings';
// Navigation Imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Create auth stack navigator
const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Home' component={Home}/>
      <Stack.Screen name='UploadRecipe' component={UploadRecipe} />
      <Stack.Screen name='Recipe' component={Recipe} />
      <Stack.Screen name='Explore' component={Explore} />
      <Stack.Screen name='Profile' component={Profile} />
      <Stack.Screen name='Settings' component={Settings} />
    </Stack.Navigator>
  )
}

export default AppStack