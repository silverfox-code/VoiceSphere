/**
 * Screens Index
 * Barrel export for all screens following feature-based architecture
 * @module @screens
 */

// ============================================================================
// AUTH SCREENS
// ============================================================================
export { HomeScreen } from './Auth/Home/HomeScreen';
export { LoginScreen } from './Auth/Login/LoginScreen';
export { SignupScreen } from './Auth/Signup/SignupScreen';

// ============================================================================
// FEED SCREENS
// ============================================================================
export { LiveFeedScreen } from './Feed/LiveFeed/LiveFeedScreen';
export { CreateTopicScreen } from './Feed/CreateTopic/CreateTopicScreen';
export { TopicDetailScreen } from './Feed/TopicDetail/TopicDetailScreen';

// ============================================================================
// VOICE ROOM SCREENS
// ============================================================================
export { VoiceRoomScreen } from './VoiceRoom/VoiceRoomScreen';

// ============================================================================
// CALLS SCREENS
// ============================================================================
export { IncomingCallScreen } from './Calls/IncomingCall/IncomingCallScreen';
export { ActiveCallScreen } from './Calls/ActiveCall/ActiveCallScreen';

// ============================================================================
// CHATS SCREENS
// ============================================================================
export { ChatsScreen } from './Chats/ChatList/ChatsScreen';
export { ChatDetailScreen } from './Chats/ChatDetail/ChatDetailScreen';

// ============================================================================
// NOTIFICATIONS SCREENS
// ============================================================================
export { NotificationsScreen } from './Notifications/NotificationList/NotificationsScreen';
export { NotificationSettingsScreen } from './Notifications/NotificationSettings/NotificationSettingsScreen';

// ============================================================================
// PROFILE SCREENS
// ============================================================================
export { ProfileScreen } from './Profile/UserProfile/ProfileScreen';
export { EditProfileScreen } from './Profile/EditProfile/EditProfileScreen';
export { SettingsScreen } from './Profile/Settings/SettingsScreen';
export { PrivacySettingsScreen } from './Profile/Settings/PrivacySettingsScreen';
export { AudioSettingsScreen } from './Profile/Settings/AudioSettingsScreen';

// ============================================================================
// SCREEN TYPES
// ============================================================================

/**
 * Screen Categories for organization
 */
export enum ScreenCategory {
    AUTH = 'Auth',
    FEED = 'Feed',
    VOICE_ROOM = 'VoiceRoom',
    CALLS = 'Calls',
    CHATS = 'Chats',
    NOTIFICATIONS = 'Notifications',
    PROFILE = 'Profile',
}

/**
 * Screen metadata for navigation and analytics
 */
export interface ScreenMetadata {
    name: string;
    category: ScreenCategory;
    requiresAuth: boolean;
    trackAnalytics: boolean;
    allowBack: boolean;
}

/**
 * All screens metadata
 */
export const SCREENS_METADATA: Record<string, ScreenMetadata> = {
    // Auth
    Home: {
        name: 'Home',
        category: ScreenCategory.AUTH,
        requiresAuth: false,
        trackAnalytics: true,
        allowBack: false,
    },
    Login: {
        name: 'Login',
        category: ScreenCategory.AUTH,
        requiresAuth: false,
        trackAnalytics: true,
        allowBack: true,
    },
    Signup: {
        name: 'Signup',
        category: ScreenCategory.AUTH,
        requiresAuth: false,
        trackAnalytics: true,
        allowBack: true,
    },

    // Feed
    LiveFeed: {
        name: 'Feed',
        category: ScreenCategory.FEED,
        requiresAuth: true,
        trackAnalytics: true,
        allowBack: false,
    },
    CreateTopic: {
        name: 'CreateTopic',
        category: ScreenCategory.FEED,
        requiresAuth: true,
        trackAnalytics: true,
        allowBack: true,
    },
    TopicDetail: {
        name: 'TopicDetail',
        category: ScreenCategory.FEED,
        requiresAuth: true,
        trackAnalytics: true,
        allowBack: true,
    },

    // Voice Room
    VoiceRoom: {
        name: 'VoiceRoom',
        category: ScreenCategory.VOICE_ROOM,
        requiresAuth: true,
        trackAnalytics: true,
        allowBack: true,
    },

    // Calls
    IncomingCall: {
        name: 'IncomingCall',
        category: ScreenCategory.CALLS,
        requiresAuth: true,
        trackAnalytics: true,
        allowBack: false,
    },
    ActiveCall: {
        name: 'CallScreen',
        category: ScreenCategory.CALLS,
        requiresAuth: true,
        trackAnalytics: true,
        allowBack: false,
    },

    // Chats
    ChatList: {
        name: 'Chats',
        category: ScreenCategory.CHATS,
        requiresAuth: true,
        trackAnalytics: true,
        allowBack: false,
    },
    ChatDetail: {
        name: 'ChatDetail',
        category: ScreenCategory.CHATS,
        requiresAuth: true,
        trackAnalytics: true,
        allowBack: true,
    },

    // Notifications
    NotificationList: {
        name: 'Notifications',
        category: ScreenCategory.NOTIFICATIONS,
        requiresAuth: true,
        trackAnalytics: true,
        allowBack: false,
    },

    // Profile
    Profile: {
        name: 'Profile',
        category: ScreenCategory.PROFILE,
        requiresAuth: true,
        trackAnalytics: true,
        allowBack: false,
    },
    EditProfile: {
        name: 'EditProfile',
        category: ScreenCategory.PROFILE,
        requiresAuth: true,
        trackAnalytics: false,
        allowBack: true,
    },
};
