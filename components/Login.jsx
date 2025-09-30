// React imports
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState } from 'react';
// Icon Imports
import Feather from 'react-native-vector-icons/Feather';
import AuthBackgroundImage from '../assets/icons/AuthBackgroundImage.svg';
// Firebase Imports
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ navigation }) => {
  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Handle login with firebase
  const handleLogin = async () => {
    // Input validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Try Firebase login
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Successful login: clear loginError and continue
      setError('');
    } catch (err) {
      // Failed login: set error message
      if (err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
        return;
      }
      else {
        setLoginError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <SafeAreaView className='flex-1'>
      {/* Ensure input area always visible */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
          <View className='pb-10'>
            {/* Auth background image */}
            <View>
              <AuthBackgroundImage />
            </View>
            {/* Nibbly Title */}
            <Text className='font-agbalumo text-5xl text-center text-[#33272A] my-5'>Nibbly</Text>
            {/* Error Message */}
            {error ? (
              <Text className='text-center text-red-600 font-roboto mb-4'>
                {error}
              </Text>
            ) : null}
            {/* Login form */}
            <View className='flex-col justify-between h-96 mx-auto'>
              {/* Input Fields */}
              <View>
                {/* Email Input */}
                <View className='flex-row items-center bg-[#DBDAEF] w-full px-6 rounded-full mb-4'>
                  <TextInput
                    className='font-roboto-semibold h-14 text-[#594A4E] flex-1'
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                    placeholderTextColor="rgba(89, 74, 78, 1)"
                  />
                </View>
                {/* Password Input */}
                <View className='flex-row items-center bg-[#DBDAEF] w-full px-6 rounded-full'>
                  <TextInput
                    className='font-roboto-semibold h-14 text-[#594A4E] flex-1'
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
                    value={password}
                    placeholderTextColor="rgba(89, 74, 78, 1)"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Login Button & sign up prompt */}
              <View>
                <TouchableOpacity onPress={() => handleLogin()} className='w-full bg-[#525B74] px-6 py-4 rounded-full'>
                  <Text className='font-roboto-bold text-medium text-white text-center'>Login</Text>
                </TouchableOpacity>
                {/* Don't have an account */}
                <View className='flex-row items-center justify-center w-full mt-5'>
                  <Text className='text-[#33272A] font-roboto mr-2'>
                    Don't have an account?
                  </Text>
                  <Text className='underline font-roboto text-[#33272A]' onPress={() => navigation.navigate('Register')}>
                    Sign up
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Login;
