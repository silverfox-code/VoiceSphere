/**
 * Navigation Constants
 * Centralized route definitions for type-safe navigation
 * @module NavigationConstants
 */

export enum NAVIGATION_ROUTES {
    // Auth Screens
    HOME = 'Home',
    LOGIN = 'Login',
    SIGNUP = 'Signup',

    // Main App - Tab Navigator
    MAIN_TABS = 'Main',
    FEED = 'Feed',
    CHATS = 'Chats',
    CALL = 'Call',
    NOTIFICATIONS = 'Notifications',
    PROFILE = 'Profile',

    // Modal Screens
    CREATE_TOPIC = 'CreateTopic',

    // Detail Screens
    TOPIC_DETAIL = 'TopicDetail',
    VOICE_ROOM = 'VoiceRoom',
    INCOMING_CALL = 'IncomingCall',
    CALL_SCREEN = 'CallScreen',
    CHAT_DETAIL = 'ChatDetail',
    USER_PROFILE = 'UserProfile',

    // Settings & Account
    SETTINGS = 'Settings',
    EDIT_PROFILE = 'EditProfile',
    NOTIFICATION_SETTINGS = 'NotificationSettings',
    PRIVACY_SETTINGS = 'PrivacySettings',
    AUDIO_SETTINGS = 'AudioSettings',

    // Support
    HELP_CENTER = 'HelpCenter',
    CONTACT_US = 'ContactUs',
    TERMS_AND_PRIVACY = 'TermsAndPrivacy',
    ABOUT = 'About',

    // Development
    DEV_SETTINGS = 'DevSettings',
    NETWORK_INSPECTOR = 'NetworkInspector',
}

/**
 * CTA Route Mapping for deep links and notifications
 * Maps external route names to internal NAVIGATION_ROUTES
 */
export const CTA_ROUTE_MAP: Record<string, NAVIGATION_ROUTES> = {
    // External names to internal routes
    home: NAVIGATION_ROUTES.HOME,
    feed: NAVIGATION_ROUTES.FEED,
    chats: NAVIGATION_ROUTES.CHATS,
    notifications: NAVIGATION_ROUTES.NOTIFICATIONS,
    profile: NAVIGATION_ROUTES.PROFILE,

    // Deep link routes
    'voice-room': NAVIGATION_ROUTES.VOICE_ROOM,
    'topic-detail': NAVIGATION_ROUTES.TOPIC_DETAIL,
    'create-topic': NAVIGATION_ROUTES.CREATE_TOPIC,
    'incoming-call': NAVIGATION_ROUTES.INCOMING_CALL,
    'chat-detail': NAVIGATION_ROUTES.CHAT_DETAIL,

    // Settings
    settings: NAVIGATION_ROUTES.SETTINGS,
    'edit-profile': NAVIGATION_ROUTES.EDIT_PROFILE,

    // Support
    help: NAVIGATION_ROUTES.HELP_CENTER,
    about: NAVIGATION_ROUTES.ABOUT,
};

/**
 * Dashboard/Tab routes for quick access
 */
export const TAB_ROUTES = [
    NAVIGATION_ROUTES.FEED,
    NAVIGATION_ROUTES.CHATS,
    NAVIGATION_ROUTES.CALL,
    NAVIGATION_ROUTES.NOTIFICATIONS,
    NAVIGATION_ROUTES.PROFILE,
];

/**
 * Auth routes (screens that don't require authentication)
 */
export const AUTH_ROUTES = [
    NAVIGATION_ROUTES.HOME,
    NAVIGATION_ROUTES.LOGIN,
    NAVIGATION_ROUTES.SIGNUP,
];

/**
 * Routes that should be tracked in analytics
 */
export const TRACKED_ROUTES = [
    NAVIGATION_ROUTES.FEED,
    NAVIGATION_ROUTES.CHATS,
    NAVIGATION_ROUTES.NOTIFICATIONS,
    NAVIGATION_ROUTES.PROFILE,
    NAVIGATION_ROUTES.VOICE_ROOM,
    NAVIGATION_ROUTES.CREATE_TOPIC,
    NAVIGATION_ROUTES.TOPIC_DETAIL,
    NAVIGATION_ROUTES.CALL_SCREEN,
    NAVIGATION_ROUTES.INCOMING_CALL,
];

/**
 * Routes that should prevent back navigation
 */
export const NO_BACK_ROUTES = [
    NAVIGATION_ROUTES.HOME,
    NAVIGATION_ROUTES.MAIN_TABS,
];
