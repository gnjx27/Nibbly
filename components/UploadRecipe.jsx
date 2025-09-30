// React Imports
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useContext } from 'react'
import { useRoute } from '@react-navigation/native'
// Icon Imports
import ArrowBack from '../assets/icons/ArrowBack.svg';
import XIcon from '../assets/icons/XIcon.svg';
import { auth } from '../firebaseConfig';
// Expo Imports
import { Image as ExpoImage } from 'expo-image';
// Services Imports
import { uploadRecipe } from '../services/recipeServices';
// Context Imports
import { UserContext } from '../contexts/UserContext';

const UploadRecipe = ({ navigation }) => {
  // Get user id
  const uid = auth.currentUser?.uid;

  // Use context
  const { contextUser } = useContext(UserContext);

  // Get imageUri from route parameter
  const route = useRoute();
  const { imageUri } = route.params || {};

  // States
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientServing, setIngredientServing] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState('');
  const [uploading, setUploading] = useState(false);

  // Refs for scrolling
  const scrollRef = useRef();
  const stepsRef = useRef();

  // Add ingredient
  const addIngredient = () => {
    if (ingredientName.trim() && ingredientServing.trim()) {
      setIngredients(prev => [
        ...prev,
        { item: ingredientName.trim(), serving: ingredientServing.trim() }
      ]);
      setIngredientName('')
      setIngredientServing('');
    }
  }

  // Remove ingredient
  const removeIngredient = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }

  // Handle upload recipe to firestore
  const handleUpload = async () => {
    // 1. Input validation
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a recipe title.');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Validation Error', 'Please enter a caption.');
      return;
    }
    if (!ingredients.length) {
      Alert.alert('Validation Error', 'Please add at least one ingredient.');
      return;
    }
    if (!steps.trim()) {
      Alert.alert('Validation Error', 'Please add the steps.');
      return;
    }

    // 2. Try uploading recipe to firestore
    try {
      setUploading(true);
      if (!uid) return;
      await uploadRecipe({ uid, title, caption, ingredients, steps, imageUri });
      Alert.alert('Success', 'Recipe uploaded successfully!');
      navigation.goBack();
    } catch (err) {
      console.log('Upload error:', err);
      Alert.alert('Error', err.message || 'Failed to upload recipe.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView>
      {/* Sticky top bar */}
      <View className='flex-row justify-between px-5 py-2 items-center'>
        {/* Back button & page title */}
        <View className='flex-row items-center'>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowBack />
          </TouchableOpacity>
          <Text className='text-[#33272A] font-roboto-bold text-lg ml-5'>Upload Recipe</Text>
        </View>
        {/* profile picture */}
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { uid: contextUser.id })}>
          <ExpoImage
            source={contextUser?.profilePicture
              ? { uri: contextUser.profilePicture }
              : require('../assets/images/DefaultProfilePic.png')
            }
            style={{ width: 40, height: 40, borderRadius: 20 }}
            contentFit="cover"
          />
        </TouchableOpacity>
      </View>

      {/* Show spinner when uploading recipe */}
      {uploading && (
        <View className="absolute inset-0 bg-black/30 justify-center items-center z-50">
          <View className="w-28 h-28 bg-[#DCDBEF] rounded-xl justify-center items-center">
            <ActivityIndicator size="medium" color="#525B74" />
          </View>
        </View>
      )}

      {/* Using keyboard aware scrollview to make sure input fields in view when keyboard appears */}
      {/* Recipe */}
      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Title Input */}
        <TextInput
          placeholder="Enter recipe title..."
          autoCapitalize="none"
          onChangeText={setTitle}
          value={title}
          placeholderTextColor="rgba(51, 39, 42, 0.75)"
          className='font-roboto-semibold text-2xl text-[#33272A] px-5 mt-5'
        />

        {/* Image */}
        {imageUri ? (
          <ExpoImage
            source={{ uri: imageUri, cache: 'force-cache' }}
            style={{ width: '100%', height: 320, marginTop: 20 }}
            contentFit="cover"
          />
        ) : (
          <Text className="px-5 mt-4 text-gray-500">No image selected</Text>
        )}

        {/* Caption */}
        <Text className='font-roboto-semibold text-2xl text-[#33272A] px-5 mt-5'>Caption</Text>
        <TextInput
          className='text-[#33272A] font-roboto text-lg px-5'
          placeholder='Add a caption...'
          placeholderTextColor="rgba(51, 39, 42, 0.75)"
          multiline={true}
          onChangeText={setCaption}
          value={caption}
        />

        {/* Ingredients */}
        <Text className='font-roboto-semibold text-2xl text-[#33272A] px-5 mt-5'>Ingredients</Text>
        {/* Input row */}
        <View className='px-5 mt-2 flex-row'>
          {/* Ingredient Name */}
          <TextInput
            textAlignVertical="center"
            style={{ lineHeight: 16 }}
            placeholderTextColor="rgba(89, 74, 78, 1)"
            className='bg-[#DCDBEF] px-5 rounded-l-full text-[#33272A] flex-1'
            placeholder='Ingredient'
            value={ingredientName}
            onChangeText={setIngredientName}
            onSubmitEditing={addIngredient}
          />
          {/* White Divider */}
          <View className='bg-white w-1 border border-[#DCDBEF] border-t-8 border-b-8' />
          {/* Serving Size */}
          <TextInput
            textAlignVertical="center"
            style={{ lineHeight: 16 }}
            placeholderTextColor="rgba(89, 74, 78, 1)"
            className='bg-[#DCDBEF] px-5 text-[#33272A] flex-1'
            placeholder='Serving'
            value={ingredientServing}
            onChangeText={setIngredientServing}
            onSubmitEditing={addIngredient}
          />
          {/* Add Ingredient Button */}
          <TouchableOpacity
            onPress={addIngredient}
            className="bg-[#525B74] px-6 py-4 self-start rounded-r-full justify-center"
          >
            <Text className="text-white font-roboto-semibold text-center">Add</Text>
          </TouchableOpacity>
        </View>

        {/* Ingredient List */}
        <View className="px-5 mt-3">
          {ingredients.length > 0 && (
            ingredients.map((item, index) => (
              <View
                key={`${item.item}-${index}`}
                className="flex-row justify-between self-start items-center bg-[#DCDBEF] px-4 py-3 rounded-full mb-2"
              >
                <Text className="text-[#33272A] font-roboto-medium">
                  {item.serving} {item.item}
                </Text>
                <TouchableOpacity className='ml-4' onPress={() => removeIngredient(index)}>
                  <View className='opacity-60'><XIcon /></View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Steps */}
        <Text className='font-roboto-semibold text-2xl text-[#33272A] px-5 mt-5'>Steps</Text>
        <TextInput
          ref={stepsRef}
          onFocus={() => {
            scrollRef.current?.scrollToFocusedInput(stepsRef.current);
          }}
          className='text-[#33272A] font-roboto text-lg px-5'
          placeholder='Add steps...'
          placeholderTextColor="rgba(51, 39, 42, 0.75)"
          multiline={true}
          onChangeText={setSteps}
          value={steps}
        />

        {/* Upload recipe button */}
        <TouchableOpacity onPress={() => handleUpload()} className='w-3/4 bg-[#525B74] mx-auto mt-8 px-6 py-4 rounded-full'>
          <Text className='font-roboto-bold text-medium text-white text-center'>Upload Recipe</Text>
        </TouchableOpacity>

      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default UploadRecipe