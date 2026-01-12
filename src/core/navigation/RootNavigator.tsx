import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from '@core/navigation/TabNavigator';
import { HomeScreen } from '../../screens/Auth/Home/HomeScreen';
import { LoginScreen } from '../../screens/Auth/Login/LoginScreen';
import { SignupScreen } from '../../screens/Auth/Signup/SignupScreen';
import { CreateTopicScreen } from '../../screens/Feed/CreateTopic/CreateTopicScreen';
import { CallScreen } from '../../screens/CallScreen';
import { TopicDetailScreen } from '../../screens/Feed/TopicDetail/TopicDetailScreen';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { NotificationProvider } from '@context/NotificationContext';

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

export const RootNavigator = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Main" component={MainStack} />
                </Stack.Navigator>
            </NotificationProvider>
        </AuthProvider>
    );
};
