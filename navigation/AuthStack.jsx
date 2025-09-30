// React Imports
import { View, Text } from 'react-native'
import React from 'react'
// Component Imports
import Login from '../components/Login'
import Register from '../components/Register'
// Navigation Imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Create auth stack navigator
const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Login' component={Login}/>
      <Stack.Screen name='Register' component={Register} />
    </Stack.Navigator>
  )
}

export default AuthStack