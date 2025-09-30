// React Imports
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';


// Icons Imports
import ArrowBack from '../assets/icons/ArrowBack.svg';
import EditIcon from '../assets/icons/EditIcon.svg';
import { Image as ExpoImage } from 'expo-image';

// Context
import { UserContext } from '../contexts/UserContext';

const Settings = ({ navigation }) => {
    const { contextUser, updateUsername, updateProfilePicture, updateBio, updating } = useContext(UserContext);

    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [newBio, setNewBio] = useState('');

    // Save username using context
    const handleSaveUsername = async () => {
        if (!newUsername.trim()) return;
        await updateUsername(newUsername.trim());
        setIsEditingUsername(false);
    };

    // Cancel username edit
    const cancelUsernameEdit = () => {
        setNewUsername('');
        setIsEditingUsername(false);
    };

    // Save bio using context
    const handleSaveBio = async () => {
        if (!newBio.trim()) return;
        await updateBio(newBio.trim());
        setIsEditingBio(false);
    };

    // Cancel bio edit
    const cancelBioEdit = () => {
        setNewBio('');
        setIsEditingBio(false);
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        await signOut(auth);
                    } catch (err) {
                        Alert.alert("Logout Error", err.message);
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView className="flex-1">
            {/* Top Bar */}
            <View className="flex-row justify-between px-5 py-2 items-center">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowBack />
                    </TouchableOpacity>
                    <Text className="text-[#33272A] font-roboto-bold text-lg ml-5">Settings</Text>
                </View>
                <ExpoImage
                    source={{ uri: contextUser?.profilePicture }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                    contentFit="cover"
                />
            </View>

            {/* Spinner */}
            {updating && (
                <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/20 items-center justify-center flex-1">
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}

            {/* Profile Picture */}
            <TouchableOpacity
                onPress={() => updateProfilePicture()}
                className="w-40 h-40 rounded-full mx-auto mt-5"
            >
                <ExpoImage
                    style={{ width: '100%', height: '100%', borderRadius: 100 }}
                    source={{ uri: contextUser?.profilePicture }}
                />
            </TouchableOpacity>
            <Text className="text-center mt-4 font-roboto text-[#33272A]">
                Tap to change profile picture
            </Text>

            {/* Username */}
            <View className="w-5/6 mx-auto mt-8">
                {isEditingUsername ? (
                    <View>
                        <Text className="font-roboto text-[#594A4E] text-lg">Edit Username</Text>
                        <TextInput
                            value={newUsername}
                            onChangeText={setNewUsername}
                            placeholder="Enter new username"
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            className="font-roboto-semibold text-xl text-[#33272A] mt-3"
                            maxLength={30}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleSaveUsername}
                        />
                        <View className="flex-row space-x-3 mt-4">
                            <TouchableOpacity
                                onPress={handleSaveUsername}
                                className="flex-1 mr-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl py-3 items-center"
                            >
                                <Text className="font-roboto-medium text-[#33272A] text-sm">Save Changes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={cancelUsernameEdit}
                                className="flex-1 bg-white/10 border border-black/20 rounded-2xl py-3 items-center"
                            >
                                <Text className="font-roboto-medium text-[#33272A] text-sm">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View className="flex-row items-center justify-between">
                        <View className='flex-1'>
                            <Text className="font-roboto text-[#594A4E] text-lg">Username</Text>
                            <Text className="font-roboto-semibold text-xl text-[#33272A] mt-2">{contextUser?.username}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setNewUsername(contextUser?.username || '');
                                setIsEditingUsername(true);
                            }}
                        >
                            <EditIcon />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Bio */}
            <View className="w-5/6 mx-auto mt-4">
                {isEditingBio ? (
                    <View>
                        <Text className="font-roboto text-[#594A4E] text-lg">Edit Bio</Text>
                        <TextInput
                            value={newBio}
                            onChangeText={setNewBio}
                            placeholder="Enter new bio"
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            className="font-roboto-semibold text-xl text-[#33272A] mt-3"
                            maxLength={30}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleSaveBio}
                        />
                        <View className="flex-row space-x-3 mt-4">
                            <TouchableOpacity
                                onPress={handleSaveBio}
                                className="flex-1 mr-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl py-3 items-center"
                            >
                                <Text className="font-roboto-medium text-[#33272A] text-sm">Save Changes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={cancelBioEdit}
                                className="flex-1 bg-white/10 border border-black/20 rounded-2xl py-3 items-center"
                            >
                                <Text className="font-roboto-medium text-[#33272A] text-sm">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View className="flex-row items-center justify-between">
                        <View className='flex-1'>
                            <Text className="font-roboto text-[#594A4E] text-lg">Bio</Text>
                            <Text className="font-roboto-medium text-lg text-[#33272A] mt-2">{contextUser?.bio}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setNewBio(contextUser?.bio || '');
                                setIsEditingBio(true);
                            }}
                        >
                            <EditIcon />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Account Info */}
            <View className="w-5/6 mx-auto mt-4">
                <Text className="font-roboto-semibold text-[#33272A] text-lg">Account</Text>
                <Text className="font-roboto text-[#594A4E] text-lg mt-1">Email</Text>
                <Text className="font-roboto-semibold text-md text-[#33272A] mt-1">{auth.currentUser?.email}</Text>
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-[#525B74] rounded-full py-3 mt-10"
                >
                    <Text className="text-center font-roboto-bold text-lg text-white">Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Settings;
