// React Imports
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useEffect, useRef, useState, useContext } from 'react';
import { useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
// Expo Imports
import { Image as ExpoImage } from 'expo-image';
// Icon Imports
import ArrowBack from '../assets/icons/ArrowBack.svg';
import YellowStar from '../assets/icons/YellowStar.svg';
import GreyStar from '../assets/icons/GreyStar.svg';
import LikeIcon from '../assets/icons/LikeIcon.svg';
import LikeIconRed from '../assets/icons/LikeIconRed.svg';
import CommentIcon from '../assets/icons/CommentIcon.svg';
import XIcon from '../assets/icons/XIcon.svg';
// Services Imports
import { timeAgo } from '../services/dateServices';
import { getComments, uploadComment } from '../services/commentServices';
import { getFirestoreUser } from '../services/userServices';
// Firebase Imports
import { auth, db } from '../firebaseConfig';
import { doc, collection, onSnapshot } from 'firebase/firestore';
// Contexts Imports
import { RecipesContext } from '../contexts/RecipesContext';
import { UserContext } from '../contexts/UserContext';

const Recipe = ({ navigation }) => {
    // Get user id
    const uid = auth.currentUser?.uid;
    // Use context
    const { userLikes, toggleLike, recipes, setRecipes } = useContext(RecipesContext);
    const { contextUser } = useContext(UserContext);

    // States and refs
    const [modalVisible, setModalVisible] = useState(false);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [comments, setComments] = useState([]);
    const scrollRef = useRef();

    // Get recipe from params
    const route = useRoute();
    const { recipe } = route.params || {};

    // Enrich recipe if not in context
    useEffect(() => {
        const existsInContext = recipes.some(r => r.id === recipe.id);
        if (!existsInContext) {
            (async () => {
                try {
                    const userData = await getFirestoreUser(recipe.userId);
                    const enrichedRecipe = {
                        ...recipe,
                        username: userData?.username || 'No username',
                        profilePicture: userData?.profilePicture || null,
                        source: 'firestore',
                    };
                    setRecipes(prev => {
                        const exists = prev.some(r => r.id === enrichedRecipe.id);
                        if (exists) return prev; // don’t add again
                        return [...prev, enrichedRecipe];
                    });
                } catch (err) {
                    console.error('Error fetching user data for recipe:', err);
                }
            })();
        }
    }, [recipe.id, recipes]);

    // Get recipe from context
    const recipeFromContext = recipes.find(r => r.id === recipe.id) || recipe;

    // Handle toggle like
    const handleToggleLike = async () => {
        toggleLike(recipeFromContext.id, recipeFromContext.source);
    };

    const renderStars = (avgRating) => {
        const stars = [];
        const fullStars = Math.floor(avgRating);
        const emptyStars = 5 - fullStars;
        for (let i = 0; i < fullStars; i++) stars.push(<View key={`full-${i}`} className='mr-1'><YellowStar /></View>);
        for (let i = 0; i < emptyStars; i++) stars.push(<View key={`empty-${i}`} className='mr-1'><GreyStar /></View>);
        return <View className="flex-row">{stars}</View>;
    }

    // Handle add comment 
    const addComment = async (recipeId, uid, comment, rating) => {
        try {
            await uploadComment(recipeId, uid, comment, rating);
            setModalVisible(false);
            setComment('');
            Alert.alert('Comment Added!');
        } catch (err) {
            console.error('Error uploading comment:', err);
            Alert.alert('Error', 'Failed to add comment.');
        }
    };

    // Listen to comments in real time
    useEffect(() => {
        if (!recipeFromContext?.id) return;
        const commentsRef = collection(db, 'recipes', recipeFromContext.id, 'comments');
        const unsubscribeComments = onSnapshot(commentsRef, async () => {
            try {
                const commentsData = await getComments(recipeFromContext.id);
                setComments(commentsData);
            } catch (err) {
                console.error('Error fetching comments in listener:', err);
            }
        });
        return () => unsubscribeComments();
    }, [recipeFromContext?.id]);

    // Listen to recipe doc changes to update avgRating, likes, commentCount
    useEffect(() => {
        if (!recipeFromContext?.id) return;
        const recipeDocRef = doc(db, 'recipes', recipeFromContext.id);
        const unsubscribeRecipe = onSnapshot(recipeDocRef, (docSnap) => {
            if (!docSnap.exists()) return;
            const updatedRecipe = docSnap.data();
            setRecipes(prev =>
                prev.map(r =>
                    r.id === recipeFromContext.id
                        ? {
                            ...r,
                            likes: updatedRecipe.likes,
                            commentCount: updatedRecipe.commentCount,
                            avgRating: updatedRecipe.avgRating,
                        }
                        : r
                )
            );
        });
        return () => unsubscribeRecipe();
    }, [recipeFromContext?.id]);

    return (
        <SafeAreaView>
            {/* Sticky top bar */}
            <View className='flex-row justify-between px-5 py-2 items-center'>
                {/* Back button & page title */}
                <View className='flex-row items-center'>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowBack />
                    </TouchableOpacity>
                    <Text className='text-[#33272A] font-roboto-bold text-lg ml-5'>Recipe</Text>
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
                {/* Poster details */}
                <View className='flex-row py-3 px-5 items-center'>
                    <ExpoImage
                        source={{ uri: recipeFromContext.profilePicture, cache: 'force-cache' }}
                        style={{ width: 48, height: 48, borderRadius: 24 }}
                        contentFit='cover'
                    />
                    <View className='ml-4'>
                        <Text className='font-roboto text-md text-[#33272A]'>{recipeFromContext.username}</Text>
                        <Text className='font-roboto text-sm text-[#594A4E]'>{timeAgo(recipeFromContext.createdAt)}</Text>
                    </View>
                </View>

                {/* Recipe Image */}
                {recipeFromContext.image ? (
                    <ExpoImage
                        source={{ uri: recipeFromContext.image, cache: 'force-cache' }}
                        style={{ width: '100%', height: 320 }}
                        contentFit="cover"
                    />
                ) : (
                    <Text className="px-5 mt-4 text-gray-500">No image selected</Text>
                )}

                {/* Avg rating */}
                {recipeFromContext.source !== 'api' && (
                    <View className="flex-row items-center mt-2 px-5">
                        {renderStars(recipeFromContext.avgRating)}
                    </View>
                )}

                {/* Title, comments & likes */}
                <View className='flex-row justify-between items-center px-5 py-2'>
                    <Text className='text=[#33272A] font-roboto-semibold text-2xl'>{recipeFromContext.title}</Text>
                    <View className='flex-row items-center'>
                        {recipeFromContext.source !== 'api' && (
                            <View className='flex-row items-center mr-4'>
                                <View className='mr-3'><CommentIcon /></View>
                                <Text className='font-roboto text-[#594A4E]'>{recipeFromContext.commentCount}</Text>
                            </View>
                        )}
                        <View className='flex-row items-center'>
                            <TouchableOpacity className='mr-3' onPress={() => handleToggleLike()}>
                                {userLikes.includes(recipeFromContext.id) ? (
                                    <LikeIconRed />
                                ) : (
                                    <LikeIcon />
                                )}
                            </TouchableOpacity>
                            {recipeFromContext.source !== 'api' && (
                                <Text className='font-roboto text-[#594A4E]'>{recipeFromContext.likes}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Caption */}
                {recipeFromContext.source !== 'api' && (
                    <View className='w-full px-5 py-2'>
                        <Text className='font-roboto text-medium text-[#33272A]'>{recipeFromContext.caption}</Text>
                    </View>
                )}

                {/* Ingredients */}
                <View className="px-5 mt-2">
                    <Text className="font-roboto-semibold text-xl text-[#33272A]">Ingredients</Text>

                    {recipeFromContext.ingredients && recipeFromContext.ingredients.length > 0 ? (
                        recipeFromContext.ingredients.map((ingredient, index) => (
                            <Text
                                key={index}
                                className="font-roboto text-md text-[#33272A] mt-1"
                            >
                                • {ingredient.item} - {ingredient.serving}
                            </Text>
                        ))
                    ) : (
                        <Text className="font-roboto text-md text-gray-500 mt-1">
                            No ingredients listed
                        </Text>
                    )}
                </View>

                {/* Steps */}
                <View className='mt-2 w-full px-5 py-2'>
                    <Text className="font-roboto-semibold text-xl text-[#33272A]">Steps</Text>
                    <Text className='font-roboto text-medium text-[#33272A]'>{recipeFromContext.steps}</Text>
                </View>

                {/* Add Comment */}
                {recipeFromContext.source !== 'api' && (
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className='ml-5 mt-5 bg-[#525B74] self-start px-5 py-4 rounded-full'
                    >
                        <Text className='font-roboto-medium text-white text-center'>Add a comment</Text>
                        {/* Add comment modal */}
                        <Modal
                            visible={modalVisible}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View className='flex-1 justify-center items-center bg-black/30'>
                                    <View className='bg-[#DBDAEF] p-5 pb-7 rounded-3xl w-10/12 shadow-sm'>
                                        {/* Rating title & X icon */}
                                        <View className='flex-row items-center justify-between px-2 mt-2'>
                                            <Text className='font-roboto-semibold text-xl text-[#33272A] mb-1'>Rating</Text>
                                            <TouchableOpacity
                                                className='self-end mb-2'
                                                onPress={() => setModalVisible(false)}
                                            >
                                                <XIcon />
                                            </TouchableOpacity>
                                        </View>
                                        {/* Rating Stars */}
                                        <View className='flex-row mb-4'>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Text
                                                    key={star}
                                                    className={`ml-1 text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    onPress={() => setRating(star)}
                                                >
                                                    ★
                                                </Text>
                                            ))}
                                        </View>
                                        {/* Comment Input */}
                                        <Text className='px-2 font-roboto-semibold text-xl text-[#33272A] mb-1'>Comment</Text>
                                        <View className='px-2'>
                                            <TextInput
                                                className='mb-4 font-roboto text-md text-[#33272A]'
                                                placeholder="Add a comment..."
                                                placeholderTextColor="rgba(51, 39, 42, 0.75)"
                                                value={comment}
                                                onChangeText={setComment}
                                                multiline
                                            />
                                        </View>
                                        {/* Send Comment Button */}
                                        <TouchableOpacity
                                            className='bg-[#525B74] px-5 py-3 rounded-full'
                                            onPress={() => addComment(recipeFromContext.id, uid, comment, rating)}
                                        >
                                            <Text className='text-white font-roboto-bold text-center'>Send comment</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>
                    </TouchableOpacity>
                )}


                {/* Comments */}
                {recipeFromContext.source !== 'api' && (
                    <View className="px-5 mt-6">
                        <Text className="font-roboto-semibold text-xl text-[#33272A] mb-2">Comments</Text>

                        {comments.length === 0 ? (
                            <Text className="text-gray-500">No comments yet</Text>
                        ) : (
                            comments.map((item) => (
                                <View key={item.id} className="flex-row mt-4">
                                    {/* User profile picture */}
                                    <ExpoImage
                                        source={{ uri: item.profilePicture }}
                                        style={{ width: 40, height: 40, borderRadius: 20 }}
                                        contentFit="cover"
                                    />

                                    {/* Comment content */}
                                    <View className="ml-3 flex-1">
                                        <View className='flex-row justify-between items-center'>
                                            <Text className="font-roboto-bold text-[#33272A] mr-3">{item.username}</Text>
                                            {/* Comment rating */}
                                            <View className='flex-row'>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Text
                                                        key={star}
                                                        className={`ml-1 text-lg ${star <= item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    >
                                                        ★
                                                    </Text>
                                                ))}
                                            </View>
                                        </View>
                                        <Text className="font-roboto text-[#33272A] mt-1">{item.comment}</Text>
                                        <Text className="text-gray-500 text-sm mt-1">{timeAgo(item.createdAt)}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default Recipe