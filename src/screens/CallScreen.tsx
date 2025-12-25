import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
// import { RTCView, mediaDevices } from 'react-native-webrtc'; // Uncomment when ready

export const CallScreen = ({ navigation, route }: any) => {
    const { topicId } = route.params || {};
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [status, setStatus] = useState('Connecting...');

    useEffect(() => {
        // Simulate connection
        const timer = setTimeout(() => {
            setStatus('Connected');
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // WebRTC logic to toggle audio track
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
        // WebRTC logic to toggle speaker
    };

    const endCall = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="flex-1 items-center justify-center">
                <View className="w-32 h-32 bg-gray-700 rounded-full items-center justify-center mb-6">
                    <Text className="text-4xl">👤</Text>
                </View>

                <Text className="text-white text-2xl font-bold mb-2">Topic #{topicId}</Text>
                <Text className="text-gray-400 text-lg mb-12">{status}</Text>

                <View className="flex-row space-x-8">
                    <TouchableOpacity
                        onPress={toggleMute}
                        className={`w-16 h-16 rounded-full items-center justify-center ${isMuted ? 'bg-white' : 'bg-gray-700'}`}
                    >
                        <Text className="text-2xl">{isMuted ? '🔇' : '🎙️'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={endCall}
                        className="w-16 h-16 rounded-full bg-red-500 items-center justify-center"
                    >
                        <Text className="text-2xl">📞</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={toggleSpeaker}
                        className={`w-16 h-16 rounded-full items-center justify-center ${isSpeakerOn ? 'bg-white' : 'bg-gray-700'}`}
                    >
                        <Text className="text-2xl">{isSpeakerOn ? '🔊' : '🔈'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};
