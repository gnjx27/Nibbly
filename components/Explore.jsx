// React Imports
import { View, Text, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';
import { useState, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
// Icon Imports
import ArrowBack from '../assets/icons/ArrowBack.svg';
// Expo Imports
import { Image as ExpoImage } from 'expo-image';
// Contexts Imports
import { RecipesContext } from '../contexts/RecipesContext';
import { UserContext } from '../contexts/UserContext';
// Services Imports
import { searchRecipes } from '../services/recipeServices';

// Dimensions for grid
const screenWidth = Dimensions.get('window').width;

const Explore = ({ navigation }) => {
    // Use
    const { recipes, loadMore, loadingMore } = useContext(RecipesContext);
    const { contextUser } = useContext(UserContext);

    // states
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Grid dimension calculation
    const numColumns = 3;
    const gap = 2;
    const itemSize = (screenWidth - gap * (numColumns - 1)) / numColumns;

    // Render items in grid
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

    // Search function
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setSearching(true);
        setHasSearched(true);
        const results = await searchRecipes(searchTerm, recipes);
        setSearchResults(results);
        setSearching(false);
    };

    // handle typing in search bar
    const handleChangeText = (text) => {
        setSearchTerm(text);

        // if user deletes everything, reset back to original grid
        if (text.trim() === "") {
            setSearchResults([]);
            setSearching(false);
            setHasSearched(false);
        }
    };

    return (
        <SafeAreaView>
            {/* Sticky top bar */}
            <View className='flex-row justify-between px-5 py-2 items-center'>
                {/* Back button & page title */}
                <View className='flex-row items-center'>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowBack />
                    </TouchableOpacity>
                    <Text className='text-[#33272A] font-roboto-bold text-lg ml-5'>Explore</Text>
                </View>
                {/* Profile Picture */}
                <View className='flex-row items-center'>
                    {/* Temporary profile picture */}
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
                    {/* <ExpoImage
                        source={require('../assets/rupert.png')}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                        contentFit="cover"
                    /> */}
                </View>
            </View>
            {/* Search bar */}
            <View className='pb-2 flex-row mt-2 w-5/6 mx-auto'>
                <TextInput
                    value={searchTerm}
                    onChangeText={handleChangeText}
                    textAlignVertical="center"
                    style={{ lineHeight: 16 }}
                    placeholderTextColor="rgba(89, 74, 78, 1)"
                    className='bg-[#DCDBEF] py-4 px-5 rounded-l-full flex-1 text-[#33272A]'
                    placeholder='Search for recipe...'
                />
                <TouchableOpacity onPress={handleSearch} className='py-4 px-5 bg-[#525B74] rounded-r-full'>
                    <Text className='font-roboto-semibold text-white text-center'>Search</Text>
                </TouchableOpacity>
            </View>
            {/* Recipe grid */}
            {searching ? (
                <Text className="text-center py-5 text-lg">Searching...</Text>
            ) : hasSearched ? (
                searchResults.length > 0 ? (
                    <FlatList
                        contentContainerStyle={{ paddingBottom: 100 }}
                        data={searchResults}
                        keyExtractor={(item, index) =>
                            item.id ? `${item.id}-${index}` : index.toString()
                        }
                        renderItem={renderItem}
                        numColumns={numColumns}
                    />
                ) : (
                    <Text className="text-center py-5 text-lg">No recipes found</Text>
                )
            ) : (
                <FlatList
                    contentContainerStyle={{ paddingBottom: 100 }}
                    data={recipes}
                    keyExtractor={(item, index) =>
                        item.id ? `${item.id}-${index}` : index.toString()
                    }
                    renderItem={renderItem}
                    numColumns={numColumns}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <Text className="text-center py-2 font-roboto text-[#594A4E]">Loading...</Text>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    )
}

export default Explore