import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Topic, TopicService } from '../services/TopicService';
import { TopicCard } from '../components/TopicCard';
import { webSocketService } from '../services/WebSocketService';
import { getCurrentUsername } from '../utils/auth';

export const FeedScreen = ({ navigation }: any) => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState('User');
    const [activePickerId, setActivePickerId] = useState<string | null>(null);

    const loadTopics = async () => {
        if (loading) return; // Prevent concurrent requests

        setLoading(true);
        try {
            const data = await TopicService.getTopics();
            setTopics(data);
        } catch (error) {
            console.error('Error loading topics:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTopics();
        setRefreshing(false);
    };

    const handleReact = async (topicId: string, emoji: string) => {
        await TopicService.addReaction(topicId, currentUser, emoji);
    };

    // Initial load - only once when component mounts
    useEffect(() => {
        // Load fixed username
        getCurrentUsername().then(setCurrentUser);

        loadTopics();

        // Connect to WebSocket
        webSocketService.connect();

        // Subscribe to "feed" channel for new topics
        webSocketService.subscribe("feed");

        const unsubscribe = webSocketService.addListener((msg) => {
            if (msg.event_type === 'NEW_TOPIC') {
                setTopics((prev) => {
                    // Prevent duplicates
                    if (prev.some(t => t.id === msg.data.id)) return prev;
                    return [msg.data, ...prev];
                });
            } else if (msg.event_type === 'TOPIC_DELETED') {
                setTopics((prev) => prev.filter(t => t.id !== msg.data.topic_id));
            } else if (msg.event_type === 'TOPIC_UPDATED') {
                setTopics((prev) => prev.map(t =>
                    t.id === msg.data.id ? msg.data : t
                ));
            }
        });

        return () => {
            unsubscribe();
            // Don't disconnect WebSocket here - other screens might be using it
        };
    }, []); // Empty dependency array - only run once!

    // Reload when screen comes into focus (optional - can be removed if not needed)
    useFocusEffect(
        useCallback(() => {
            // Only reload if we don't have topics yet
            if (topics.length === 0) {
                loadTopics();
            }
        }, []) // Empty deps - we check topics.length inside
    );

    return (
        <SafeAreaView className="flex-1 bg-wakie-bg">
            {/* Top Navigation Tabs */}
            <View className="flex-row px-4 py-2 bg-wakie-bg items-center justify-between">
                <View className="flex-row">
                    <TouchableOpacity className="bg-gray-700 px-4 py-2 rounded-full mr-2">
                        <Text className="text-white font-bold">Live Feed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-4 py-2 mr-2">
                        <Text className="text-gray-400 font-semibold">My Feed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-4 py-2">
                        <Text className="text-gray-400 font-semibold">Clubs</Text>
                    </TouchableOpacity>
                </View>
                <Text className="text-gray-500 text-xs">{currentUser}</Text>
            </View>

            {/* "What's on your mind" Input Section */}
            <View className="px-4 py-3 bg-wakie-card border-b border-gray-800 flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full bg-gray-600 mr-3 items-center justify-center">
                    <Text className="text-white font-bold">{currentUser[0]?.toUpperCase() || 'U'}</Text>
                </View>
                <TouchableOpacity
                    className="flex-1"
                    onPress={() => navigation.navigate('CreateTopic')}
                >
                    <Text className="text-gray-400 text-base">What's on your mind</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-4">
                <FlatList
                    data={topics}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TopicCard
                            topic={item.title}
                            topicId={item.id}
                            author={item.author}
                            commentCount={item.comment_count || 0}
                            reactions={item.reactions}
                            onPress={() => navigation.navigate('TopicDetail', { topic: item })}
                            onReact={(emoji) => handleReact(item.id, emoji)}
                            activePickerId={activePickerId}
                            setActivePickerId={setActivePickerId}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#3A05A9"
                        />
                    }
                    ListEmptyComponent={
                        loading ? (
                            <Text className="text-gray-500 text-center mt-10">Loading topics...</Text>
                        ) : (
                            <Text className="text-gray-500 text-center mt-10">No active topics right now.</Text>
                        )
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </SafeAreaView>
    );
};
