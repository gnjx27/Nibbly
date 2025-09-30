// React Imports
import { View, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Pressable, Touchable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback, useContext } from 'react';
// Expo Imports
import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from 'expo-image';
// Icon Imports
import SearchIcon from '../assets/icons/SearchIcon.svg';
import LikeIcon from '../assets/icons/LikeIcon.svg';
import LikeIconRed from '../assets/icons/LikeIconRed.svg';
import UploadButton from '../assets/icons/UploadButton.svg';
// Context Imports
import { RecipesContext } from '../contexts/RecipesContext';
import { UserContext } from '../contexts/UserContext';

const Home = ({ navigation }) => {
    // Use context
    const { recipes, userLikes, loadMore, loadingMore, loading, toggleLike, selectedFilter, setSelectedFilter, refreshRecipes } = useContext(RecipesContext);  
    const { contextUser } = useContext(UserContext);
    // States
    const [showOptions, setShowOptions] = useState(false);

    // Filters
    const filters = [
        { key: 'all', label: 'All' },
        { key: 'recently uploaded', label: 'Recently uploaded' },
        { key: 'most popular', label: 'Most popular' },
        { key: 'top rated', label: 'Top rated' },
    ]

    // Ensure upload options closed each time component in focus
    useFocusEffect(
        useCallback(() => {
            return () => {
                setShowOptions(false);
            };
        }, [])
    );

    // Handle filter press
    const handleFilterPress = (filter) => {
        setSelectedFilter(filter);
    }

    // Render recipe components 
    const renderRecipe = ({ item }) => (
        <View className="mt-4">
            {/* Recipe Image */}
            <TouchableOpacity 
                style={{ width: '100%', height: 320, backgroundColor: '#E0E0E0' }}
                onPress={() => navigation.navigate('Recipe', { recipe: item })}
            >
                {item.image ? (
                    <ExpoImage
                        source={{ uri: item.image, cache: 'force-cache' }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                    />
                ) : (
                    <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Text>Loading image...</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View className="px-5 py-2">
                {/* Recipe title & likes */}
                <View className='flex-row justify-between'>
                    <Text className="font-roboto-bold text-xl text-[#33272A] mb-1 w-80">
                        {item.title}
                    </Text>
                    <View className='flex-row items-center ml-8'>
                        <TouchableOpacity className='mr-3' onPress={() => toggleLike(item.id, item.source)}>
                            {userLikes.includes(item.id) ? (
                                <LikeIconRed />
                            ) : (
                                <LikeIcon />
                            )}
                        </TouchableOpacity>
                        {item.source == 'firestore' && (
                            <Text className='font-roboto text-lg text-[#594A4E]'>{item.likes}</Text>
                        )}
                    </View>
                </View>
                {/* Poster profile picture & username */}
                <View className='flex-row items-center'>
                    <TouchableOpacity 
                        onPress={item.source === 'api' 
                            ? () => {} 
                            : () => navigation.navigate('Profile', { uid: item.userId })
                        }
                    >
                        <ExpoImage
                            source={{ uri: item.profilePicture, cache: 'force-cache' }}
                            style={{ width: 48, height: 48, borderRadius: 24 }}
                            contentFit='cover'
                        />
                    </TouchableOpacity>
                    <Text className='ml-3 font-roboto text-medium text-[#33272A]'>{item.username}</Text>
                </View>
            </View>
        </View>
    );

    // Handle take photo button onpress
    const handleTakePhoto = async () => {
        // 1. Ask for camera permissions
        const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (newStatus !== "granted") {
            Alert.alert(
                "Permission needed",
                "Please allow camera access in Settings to take a photo.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Settings", onPress: () => Linking.openSettings() },
                ]
            );
            return;
        }
        // 2. Launch the camera
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });
        // 3. Handle the result
        if (!result.canceled) {
            const photoUri = result.assets[0].uri;
            navigation.navigate("UploadRecipe", { imageUri: photoUri });
        }
    }

    const handleFromGallery = async () => {
        // 1. Check current permissions
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            // Ask for permission
            const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (newStatus !== "granted") {
                Alert.alert(
                    "Permission needed",
                    "Please allow photo library access in Settings to choose a picture.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Open Settings", onPress: () => Linking.openSettings() },
                    ]
                );
                return;
            }
        }
        // 2. Launch the gallery picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        // 3. Handle result
        if (!result.canceled) {
            const selectedUri = result.assets[0].uri;
            navigation.navigate("UploadRecipe", { imageUri: selectedUri });
        }
    };

    return (
        <SafeAreaView className='flex flex-1' edges={['top', 'left', 'right']}>
            {/* Sticky top bar */}
            <View className='flex-row justify-between px-5 items-center'>
                {/* Nibbly title */}
                <TouchableOpacity onPress={refreshRecipes}>
                    <Text className='text-[#33272A] font-agbalumo text-3xl'>Nibbly</Text>
                </TouchableOpacity>
                {/* Search Icon & Profile Picture */}
                <View className='flex-row items-center'>
                    <View className='mr-6'>
                        <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                            <SearchIcon />
                        </TouchableOpacity>
                    </View>
                    {/* profile picture */}
                    <TouchableOpacity onPress={() => navigation.navigate('Profile', { uid: contextUser?.id })}>
                        <ExpoImage
                            source={contextUser?.profilePicture 
                                ? { uri: contextUser?.profilePicture }
                                : require('../assets/images/DefaultProfilePic.png')
                            }
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                            contentFit="cover"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sticky filter bar */}
            <View className='pt-4 pb-2'>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName='px-5'
                >
                    {filters.map((filter, index) => (
                        <TouchableOpacity
                            key={filter.key}
                            onPress={() => handleFilterPress(filter.key)}
                            className={`px-5 py-3 rounded-full ${selectedFilter === filter.key ? 'bg-[#E9D8EC]' : 'bg-[#D8D8EC]'} ${index !== filters.length - 1 ? 'mr-3' : ''}`}
                        >
                            <Text className="font-roboto text-[#594A4E] text-center">
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Recipes */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="font-roboto text-[#594A4E] mt-10">Loading recipes...</Text>
                </View>
            ) : (
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={recipes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRecipe}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator size="large" color="#594A4E" style={{ marginVertical: 20 }} />
                        ) : null
                    }
                />
            )}

            {/* Upload Options overlay */}
            {showOptions && (
                <>
                    {/* Transparent background to detect outside taps */}
                    <Pressable
                        className="absolute inset-0 z-40"
                        onPress={() => setShowOptions(false)}
                    />

                    {/* Options buttons */}
                    <View className="absolute bottom-24 right-6 z-50">
                        <TouchableOpacity
                            className="bg-[#525B74] rounded-full px-5 py-4 mb-3"
                            onPress={() => handleTakePhoto()}
                        >
                            <Text className="font-roboto text-sm text-white text-center">Take photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-[#525B74] rounded-full px-5 py-4 mb-5"
                            onPress={() => handleFromGallery()}
                        >
                            <Text className="font-roboto text-sm text-white text-center">From gallery</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Sticky upload recipe button */}
            <TouchableOpacity onPress={() => setShowOptions(!showOptions)} className="absolute bottom-8 right-6">
                <UploadButton />
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default Home