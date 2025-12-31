import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { TopicService } from '../services/TopicService';
import { getCurrentUsername } from '../utils/auth';

export const CreateTopicScreen = ({ navigation }: any) => {
    const [title, setTitle] = useState('');
    const [currentUser, setCurrentUser] = useState('User');

    useEffect(() => {
        getCurrentUsername().then(setCurrentUser);
    }, []);

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        try {
            // Create topic with empty description
            await TopicService.createTopic(title, '', currentUser);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to create topic');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-wakie-bg">
            <View className="px-4 py-3 border-b border-gray-800 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-wakie-primary text-lg font-bold">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Create Topic</Text>
                <TouchableOpacity onPress={handleCreate}>
                    <Text className="text-wakie-primary text-lg font-bold">Post</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-1 p-4">
                <Text className="text-gray-400 text-sm mb-2">Posting as: {currentUser}</Text>

                <TextInput
                    className="bg-wakie-card text-white text-xl font-bold p-4 rounded-lg"
                    placeholder="What's on your mind?"
                    placeholderTextColor="#6B7280"
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                    multiline
                />
            </View>
        </SafeAreaView>
    );
};
