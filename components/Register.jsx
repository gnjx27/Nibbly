// React imports
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
// Icon Imports
import Feather from 'react-native-vector-icons/Feather';
import AuthBackgroundImage from '../assets/icons/AuthBackgroundImage.svg';
// Firebase Imports
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const Register = ({ navigation }) => {
  // States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Handle register of user account
  const handleRegister = async () => {
    // Input validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return;
    }
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Try register user with Firebase
    try {
      // 1. Create auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // 2. Create a firstore document in users collection
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        bio: 'New to Nibbly!',
        profilePicture: 'https://firebasestorage.googleapis.com/v0/b/nibbly-411da.firebasestorage.app/o/profilePictures%2FDefaultProfilePic.png?alt=media&token=2c94da0f-d9f8-4650-98e0-77b0648d9bc5',
        createdAt: serverTimestamp(),
      })
      // 3. Registration success: clear error, display success message
      setError('');
      Alert.alert('Success', 'Welcome to Nibbly!');
    } catch (err) {
      // Failed register: set error message
      if (err.code == 'auth/email-already-in-use') {
        setError('Email already in use.');
        return;
      } else {
        Alert.alert('Registration error: ', err.message);
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
              {/* Register form */}
              <View className='flex-col justify-between h-96 mx-auto'>
                {/* Input Fields */}
                <View>
                  {/* Username Input */}
                  <View className='flex-row items-center bg-[#DBDAEF] w-full px-6 rounded-full mb-4'>
                    <TextInput
                      className='font-roboto-semibold h-14 text-[#594A4E] flex-1'
                      placeholder="Username"
                      autoCapitalize="none"
                      onChangeText={setUsername}
                      value={username}
                      placeholderTextColor="rgba(89, 74, 78, 1)"
                    />
                  </View>
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
                  <View className='flex-row items-center bg-[#DBDAEF] w-full px-6 rounded-full mb-4'>
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
                  {/* Confirm Password Input */}
                  <View className='flex-row items-center bg-[#DBDAEF] w-full px-6 rounded-full'>
                    <TextInput
                      className='font-roboto-semibold h-14 text-[#594A4E] flex-1'
                      placeholder="Confirm password"
                      secureTextEntry={!showConfirmPassword}
                      onChangeText={setConfirmPassword}
                      value={confirmPassword}
                      placeholderTextColor="rgba(89, 74, 78, 1)"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Register Button & login prompt */}
                <View>
                  <TouchableOpacity onPress={() => handleRegister()} className='w-full bg-[#525B74] px-6 py-4 rounded-full'>
                    <Text className='font-roboto-bold text-medium text-white text-center'>Register</Text>
                  </TouchableOpacity>
                  {/* Already have an account */}
                  <View className='flex-row items-center justify-center w-full mt-5'>
                    <Text className='text-[#33272A] font-roboto mr-2'>
                      Already have an account?
                    </Text>
                    <Text className='underline font-roboto text-[#33272A]' onPress={() => navigation.navigate('Login')}>
                      Login
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

export default Register;
