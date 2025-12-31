import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FeedScreen } from '../screens/FeedScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { HomeIcon, PhoneIcon, BellIcon, UserIcon, CommentIcon } from '../components/Icons';
import { useNotifications } from '../context/NotificationContext';

const Tab = createBottomTabNavigator();

const EmptyScreen = () => <View className="flex-1 bg-wakie-bg" />;

export const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#171717',
                    borderTopColor: '#32325A',
                    height: 60,
                    paddingBottom: 10,
                },
                tabBarActiveTintColor: '#3A05A9',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Feed"
                component={FeedScreen}
                options={{
                    tabBarIcon: ({ color }) => <HomeIcon size={28} color={color} />,
                }}
            />
            <Tab.Screen
                name="Chats"
                component={EmptyScreen}
                options={{
                    tabBarIcon: ({ color }) => <CommentIcon size={28} color={color} />,
                }}
            />
            <Tab.Screen
                name="Call"
                component={EmptyScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View className={`w-14 h-14 rounded-full items-center justify-center -mt-6 border-4 border-gray-900 ${focused ? 'bg-wakie-primary' : 'bg-gray-700'}`}>
                            <PhoneIcon size={28} color="white" />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    tabBarIcon: ({ color }) => {
                        const { unreadCount } = useNotifications();
                        return (
                            <View>
                                <BellIcon size={28} color={color} />
                                {unreadCount > 0 && (
                                    <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                                        <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => <UserIcon size={28} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};
