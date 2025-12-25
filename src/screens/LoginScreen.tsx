import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuth();

    const handleLogin = async () => {
        if (!email) {
            // Add validation feedback if needed
            return;
        }
        await login(email);
    };

    return (
        <View className="flex-1 bg-gray-900 justify-center p-6">
            <Text className="text-white text-3xl font-bold mb-8 text-center">Welcome Back</Text>

            <View className="space-y-4">
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
                        placeholder="Enter your password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    className="bg-blue-500 p-4 rounded-lg items-center mt-6"
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Log In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-4">
                    <Text className="text-gray-400 text-center">
                        Don't have an account? <Text className="text-blue-400">Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
