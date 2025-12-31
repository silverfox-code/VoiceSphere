import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen = () => {
    const { user, logout } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="flex-1 px-4 pt-4 items-center">
                <View className="w-24 h-24 bg-gray-700 rounded-full items-center justify-center mb-4 mt-8">
                    <Text className="text-4xl">👤</Text>
                </View>

                <Text className="text-white text-2xl font-bold mb-1">{user?.name || 'User'}</Text>
                <Text className="text-gray-400 mb-8">@{user?.name?.toLowerCase().replace(' ', '') || 'username'}</Text>

                <View className="w-full space-y-4">
                    <TouchableOpacity className="bg-gray-800 p-4 rounded-xl flex-row justify-between items-center">
                        <Text className="text-white text-lg">Edit Profile</Text>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-gray-800 p-4 rounded-xl flex-row justify-between items-center">
                        <Text className="text-white text-lg">Settings</Text>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-red-500/10 p-4 rounded-xl flex-row justify-center items-center mt-8"
                        onPress={logout}
                    >
                        <Text className="text-red-500 text-lg font-bold">Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};
