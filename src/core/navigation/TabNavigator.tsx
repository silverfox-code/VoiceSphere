import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LiveFeedScreen } from '../../screens/Feed/LiveFeed/LiveFeedScreen';
import { ChatsScreen } from '../../screens/Chats/ChatList/ChatsScreen';
import { NotificationsScreen } from '../../screens/Notifications/NotificationList/NotificationsScreen';
import { ProfileScreen } from '../../screens/Profile/UserProfile/ProfileScreen';
import { HomeIcon, PhoneIcon, BellIcon, UserIcon, CommentIcon } from '../../components/Icons';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../theme';

const Tab = createBottomTabNavigator();

const EmptyScreen = () => {
    const { colors } = useTheme();
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
};

export const TabNavigator = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 5,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray500,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Feed"
                component={LiveFeedScreen}
                options={{
                    tabBarIcon: ({ color }) => <HomeIcon size={24} color={color} />,
                    tabBarLabel: 'Feed',
                }}
            />
            <Tab.Screen
                name="Chats"
                component={ChatsScreen}
                options={{
                    tabBarIcon: ({ color }) => <CommentIcon size={24} color={color} />,
                    tabBarLabel: 'Chats',
                }}
            />
            <Tab.Screen
                name="Call"
                component={EmptyScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[
                            { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: -24, borderWidth: 4, borderColor: colors.background },
                            focused ? { backgroundColor: colors.primary } : { backgroundColor: colors.card }
                        ]}>
                            <PhoneIcon size={26} color="white" />
                        </View>
                    ),
                    tabBarLabel: '',
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
                                <BellIcon size={24} color={color} />
                                {unreadCount > 0 && (
                                    <View style={{
                                        position: 'absolute',
                                        top: -1,
                                        right: -1,
                                        backgroundColor: colors.error,
                                        width: 16,
                                        height: 16,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    },
                    tabBarLabel: 'Alerts',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => <UserIcon size={24} color={color} />,
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
};
