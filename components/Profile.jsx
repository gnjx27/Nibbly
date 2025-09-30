// React Imports
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useContext } from 'react';
import { useRoute } from '@react-navigation/native'
// Icon Imports
import ArrowBack from '../assets/icons/ArrowBack.svg';
import PostsIcon from '../assets/icons/PostsIcon.svg';
import LikeIcon from '../assets/icons/LikeIcon.svg';
import SettingsIcon from '../assets/icons/SettingsIcon.svg';
// Expo Imports
import { Image as ExpoImage } from 'expo-image';
// Services Imports
import { getFirestoreUser } from '../services/userServices';
import { getRecipesForUser, getRecipesById } from '../services/recipeServices';
// Firebase Imports
import { auth } from '../firebaseConfig';
// Context Imports
import { RecipesContext } from '../contexts/RecipesContext';
import { UserContext } from '../contexts/UserContext';

// Dimensions for grid
const screenWidth = Dimensions.get('window').width;

const Profile = ({ navigation }) => {
    // Get user id from params
    const route = useRoute();
    const { uid } = route.params || {};

    // Use context
    const { userLikes } = useContext(RecipesContext);
    const { contextUser } = useContext(UserContext);

    // States
    const [user, setUser] = useState(null); // Profile being viewed
    const [recipes, setRecipes] = useState([]);
    const [owner, setOwner] = useState(false);
    const [tab, setTab] = useState('posts');
    const [likedRecipes, setLikedRecipes] = useState([]);

    // Check if current user is owner of profile
    useEffect(() => {
        if (auth.currentUser?.uid === uid) {
            setOwner(true);
        }
    }, [uid]);

    // Fetch user data for the profile being viewed
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getFirestoreUser(uid);
            setUser(userData);
        }
        fetchUser();
    }, [uid]);

    // Fetch recipes for this user
    useEffect(() => {
        const fetchRecipes = async () => {
            const recipesData = await getRecipesForUser(uid);
            setRecipes(recipesData);
        }
        fetchRecipes();
    }, [uid]);

    // Fetch liked recipes
    useEffect(() => {
        const fetchUserLikedRecipes = async () => {
            const liked = await getRecipesById(userLikes);
            setLikedRecipes(liked);
        }
        fetchUserLikedRecipes();
    }, [userLikes]);

    // Grid dimension calculation
    const numColumns = 3;
    const gap = 2;
    const itemSize = (screenWidth - gap * (numColumns - 1)) / numColumns;

    // Render grid item
    const renderItem = ({ item, index }) => {
        const isLastColumn = (index + 1) % numColumns === 0;
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('Recipe', { recipe: item })}
                style={{
                    marginRight: isLastColumn ? 0 : gap,
                    marginBottom: gap
                }}
            >
                <ExpoImage
                    source={{ uri: item.image }}
                    style={{
                        width: itemSize,
                        height: itemSize,
                        borderRadius: 0,
                    }}
                    contentFit="cover"
                />
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView>
            {/* Sticky top bar */}
            <View className='flex-row justify-between px-5 py-2 items-center'>
                <View className='flex-row items-center'>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowBack />
                    </TouchableOpacity>
                    <Text className='text-[#33272A] font-roboto-bold text-lg ml-5'>Profile</Text>
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

            {/* Profile pic, username & bio (from Firestore user) */}
            <View className='flex-row mx-8 py-3 border-b border-black/25'>
                <View>
                    <ExpoImage
                        source={
                            owner 
                            ? { uri: contextUser?.profilePicture }
                            : { uri: user?.profilePicture }
                    }
                        style={{ width: 80, height: 80, borderRadius: 50 }}
                    />
                </View>
                <View className='ml-5 flex-1'>
                    {/* Username & Settings */}
                    <View className='flex-row items-center justify-between'>
                        <Text className='font-roboto-bold text-xl mb-1'>{owner ? contextUser?.username : user?.username}</Text>
                        {owner && (
                            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                                <SettingsIcon />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View className='flex-row items-center mb-2'>
                        <Text className='font-roboto-semibold text-[#33272A]'>{recipes?.length} </Text>
                        <Text className='font-roboto text-[#594A4E]'>Posts</Text>
                    </View>
                    <Text className='font-roboto text-[#33272A]'>{owner ? contextUser?.bio : user?.bio}</Text>
                </View>
            </View>

            {/* Posts & Liked Tabs */}
            {owner ? (
                <View className='flex-row justify-center'>
                    <TouchableOpacity
                        onPress={() => setTab('posts')}
                        className={`py-1 mr-4 flex-row items-center ${tab == 'posts' ? `border-t text-[#33272A]` : `border-t border-white/0`}`}
                    >
                        <PostsIcon />
                        <Text className={`font-roboto self-start py-1 text-sm ${tab == 'posts' ? `text-[#33272A]` : `text-[#594A4E]`}`}> POSTS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`py-1 flex-row items-center ${tab == 'liked' ? `border-t` : `border-t border-white/0`}`}
                        onPress={() => setTab('liked')}
                    >
                        <LikeIcon />
                        <Text className={`font-roboto text-[#33272A] self-start py-1 ${tab == 'liked' ? `text-[#33272A]` : `text-[#594A4E]`}`}> Liked</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className='flex-row justify-center'>
                    <TouchableOpacity
                        onPress={() => setTab('posts')}
                        className={`py-1 mr-4 flex-row items-center border-t text-[#33272A]`}
                    >
                        <PostsIcon />
                        <Text className={`font-roboto self-start py-1 text-sm text-[#33272A]}`}> POSTS</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Recipes Grid */}
            <FlatList
                contentContainerStyle={{ paddingBottom: 250 }}
                data={tab === 'posts' ? recipes : likedRecipes}
                keyExtractor={(item, index) =>
                    item.id ? `${item.id}-${index}` : index.toString()
                }
                renderItem={renderItem}
                numColumns={numColumns}
            />
        </SafeAreaView>
    );
}

export default Profile;
