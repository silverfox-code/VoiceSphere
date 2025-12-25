import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { CreateTopicScreen } from '../screens/CreateTopicScreen';
import { CallScreen } from '../screens/CallScreen';
import { TopicDetailScreen } from '../screens/TopicDetailScreen';

import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const MainStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
            name="CreateTopic"
            component={CreateTopicScreen}
            options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
        <Stack.Screen name="Call" component={CallScreen} />
    </Stack.Navigator>
);

const AppStack = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
                <ActivityIndicator size="large" color="#60A5FA" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <Stack.Screen name="Authenticated" component={MainStack} />
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

import { NotificationProvider } from '../context/NotificationContext';

export const RootNavigator = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <NavigationContainer>
                    {/* Always render MainStack to bypass auth and keep navigation working */}
                    <MainStack />
                </NavigationContainer>
            </NotificationProvider>
        </AuthProvider>
    );
};
