import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import { CommentIcon, BellIcon } from '../components/Icons';

export const NotificationsScreen = ({ navigation }: any) => {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    const handlePress = (notification: any) => {
        markAsRead(notification.id);
        if (notification.type === 'NEW_COMMENT') {
            // Navigate to TopicDetail with the topic object
            // Note: We need the full topic object, but the notification might only have the ID.
            // For now, we'll pass what we have and let TopicDetail handle fetching or partial data if needed.
            // Ideally, the backend notification payload should include topic title/author.
            // Or TopicDetail should fetch topic by ID.

            // Assuming we need to fetch topic details or pass a minimal topic object
            // Let's construct a minimal topic object from the notification data
            const topic = {
                id: notification.data.topic_id,
                title: "Topic", // Placeholder, ideally from notification
                author: "Unknown", // Placeholder
                description: "Loading...", // Placeholder
            };
            navigation.navigate('TopicDetail', { topic });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-wakie-bg">
            <View className="flex-1 px-4 pt-4">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-white text-3xl font-bold">Notifications</Text>
                    {notifications.length > 0 && (
                        <TouchableOpacity onPress={markAllAsRead}>
                            <Text className="text-wakie-primary font-bold">Mark all read</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handlePress(item)}
                            className={`p-4 rounded-xl mb-3 border ${item.read ? 'bg-wakie-card border-gray-800' : 'bg-gray-800 border-wakie-primary/50'}`}
                        >
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.read ? 'bg-gray-700' : 'bg-wakie-primary/20'}`}>
                                    <CommentIcon size={20} color={item.read ? '#9CA3AF' : '#A78BFA'} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-base ${item.read ? 'text-gray-300' : 'text-white font-bold'}`}>
                                        {item.message}
                                    </Text>
                                    <Text className="text-gray-500 text-xs mt-1">
                                        {item.timestamp.toLocaleTimeString()}
                                    </Text>
                                </View>
                                {!item.read && (
                                    <View className="w-2 h-2 rounded-full bg-wakie-primary ml-2" />
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <BellIcon size={64} color="#374151" />
                            <Text className="text-gray-500 mt-4 text-lg">No notifications yet</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
};
