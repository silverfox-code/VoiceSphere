import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../context/AuthContext';

export const SignupScreen = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup, isLoading } = useAuth();

    const handleSignup = async () => {
        if (!email || !name) {
            // Add validation feedback if needed
            return;
        }
        await signup(email, name);
    };

    return (
        <View className="flex-1 bg-gray-900 justify-center p-6">
            <Text className="text-white text-3xl font-bold mb-8 text-center">Create Account</Text>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-400 mb-2">Full Name</Text>
                    <TextInput
                        className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                        placeholder="Enter your name"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View>
                    <Text className="text-gray-400 mb-2">Email</Text>
                    <TextInput
                        className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                        placeholder="Enter your email"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View>
                    <Text className="text-gray-400 mb-2">Password</Text>
                    <TextInput
                        className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                        placeholder="Choose a password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    className="bg-blue-500 p-4 rounded-lg items-center mt-6"
                    onPress={handleSignup}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
                    <Text className="text-gray-400 text-center">
                        Already have an account? <Text className="text-blue-400">Log In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
