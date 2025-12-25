import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

const MOCK_CLUBS = [
    { id: '1', name: 'Tech Talk', members: 1250, active: 45 },
    { id: '2', name: 'Music Lovers', members: 890, active: 32 },
    { id: '3', name: 'Startup Grind', members: 3400, active: 120 },
    { id: '4', name: 'Language Exchange', members: 2100, active: 80 },
];

export const ClubsScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="flex-1 px-4 pt-4">
                <Text className="text-white text-3xl font-bold mb-6">Clubs</Text>

                <FlatList
                    data={MOCK_CLUBS}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-white text-xl font-bold">{item.name}</Text>
                                <View className="bg-green-900 px-2 py-1 rounded-full">
                                    <Text className="text-green-400 text-xs">{item.active} active</Text>
                                </View>
                            </View>
                            <Text className="text-gray-400">{item.members} members</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};
