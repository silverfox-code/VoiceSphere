/**
 * Application-wide constants
 * @module @constants
 */

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// Timeout Constants (milliseconds)
// ============================================================================

export const TIMEOUTS = {
    API_REQUEST: 30000, // 30 seconds
    API_REQUEST_LONG: 60000, // 1 minute
    WEBSOCKET_CONNECT: 10000, // 10 seconds
    WEBSOCKET_RECONNECT: 5000, // 5 seconds
    DEBOUNCE_DEFAULT: 300, // 300ms
    DEBOUNCE_SEARCH: 500, // 500ms
    THROTTLE_DEFAULT: 1000, // 1 second
    CALL_TIMEOUT: 60000, // 1 minute
    TOAST_DURATION: 3000, // 3 seconds
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
    AUTH_TOKEN: '@voicesphere:auth_token',
    REFRESH_TOKEN: '@voicesphere:refresh_token',
    USER_DATA: '@voicesphere:user_data',
    USER_PREFERENCES: '@voicesphere:user_preferences',
    CACHED_TOPICS: '@voicesphere:cached_topics',
    LAST_SYNC: '@voicesphere:last_sync',
    FCM_TOKEN: '@voicesphere:fcm_token',
    ONBOARDING_COMPLETED: '@voicesphere:onboarding_completed',
    DEVICE_ID: '@voicesphere:device_id',
    ANALYTICS_USER_ID: '@voicesphere:analytics_user_id',
} as const;

// ============================================================================
// WebSocket Events
// ============================================================================

export const WS_EVENTS = {
    // Connection Events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',
    RECONNECT: 'reconnect',
    RECONNECT_ATTEMPT: 'reconnect_attempt',
    RECONNECT_FAILED: 'reconnect_failed',

    // Room Events
    ROOM_JOIN: 'room:join',
    ROOM_LEAVE: 'room:leave',
    ROOM_UPDATE: 'room:update',
    ROOM_CREATED: 'room:created',
    ROOM_DELETED: 'room:deleted',

    // User Events
    USER_JOINED: 'user:joined',
    USER_LEFT: 'user:left',
    USER_SPEAKING: 'user:speaking',
    USER_MUTED: 'user:muted',
    USER_UNMUTED: 'user:unmuted',
    USER_HAND_RAISED: 'user:hand_raised',
    USER_HAND_LOWERED: 'user:hand_lowered',

    // Message Events
    MESSAGE: 'message',
    MESSAGE_RECEIVED: 'message:received',
    MESSAGE_SENT: 'message:sent',

    // Topic Events
    TOPIC_CREATED: 'topic:created',
    TOPIC_UPDATED: 'topic:updated',
    TOPIC_DELETED: 'topic:deleted',

    // Call Events
    CALL_INCOMING: 'call:incoming',
    CALL_ACCEPTED: 'call:accepted',
    CALL_REJECTED: 'call:rejected',
    CALL_ENDED: 'call:ended',
    CALL_MISSED: 'call:missed',

    // WebRTC Signaling Events
    SIGNAL_OFFER: 'signal:offer',
    SIGNAL_ANSWER: 'signal:answer',
    SIGNAL_ICE_CANDIDATE: 'signal:ice_candidate',
} as const;

// ============================================================================
// WebRTC Configuration
// ============================================================================

export const WEBRTC_CONFIG = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302',
        },
        {
            urls: 'stun:stun1.l.google.com:19302',
        },
        // Add TURN servers in production
        // {
        //   urls: 'turn:your-turn-server.com:3478',
        //   username: 'username',
        //   credential: 'credential',
        // },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle' as RTCBundlePolicy,
    rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
} as const;

// ============================================================================
// Media Constraints
// ============================================================================

export const MEDIA_CONSTRAINTS = {
    AUDIO_ONLY: {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1,
        },
        video: false,
    },
    VIDEO_CALL: {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        },
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
            facingMode: 'user',
        },
    },
} as const;

// ============================================================================
// Pagination Defaults
// ============================================================================

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
    TOPIC_MIN_LENGTH: 10,
    TOPIC_MAX_LENGTH: 300,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    PHONE_NUMBER_LENGTH: 10,
    OTP_LENGTH: 6,
} as const;

// ============================================================================
// Rate Limiting
// ============================================================================

export const RATE_LIMITS = {
    TOPIC_CREATION_PER_HOUR: 10,
    MESSAGE_SEND_PER_MINUTE: 60,
    ROOM_JOIN_PER_MINUTE: 10,
    API_CALLS_PER_MINUTE: 100,
} as const;

// ============================================================================
// Audio Configuration
// ============================================================================

export const AUDIO_CONFIG = {
    SAMPLE_RATE: 48000,
    CHANNELS: 1,
    BIT_DEPTH: 16,
    CODEC: 'opus',
    BITRATE: 24000, // 24 kbps
} as const;

// ============================================================================
// Network Quality Thresholds
// ============================================================================

export const NETWORK_QUALITY_THRESHOLDS = {
    EXCELLENT: {
        maxLatency: 50, // ms
        maxJitter: 10, // ms
        maxPacketLoss: 1, // %
    },
    GOOD: {
        maxLatency: 100, // ms
        maxJitter: 20, // ms
        maxPacketLoss: 3, // %
    },
    FAIR: {
        maxLatency: 200, // ms
        maxJitter: 40, // ms
        maxPacketLoss: 5, // %
    },
    POOR: {
        maxLatency: 400, // ms
        maxJitter: 80, // ms
        maxPacketLoss: 10, // %
    },
} as const;

// ============================================================================
// Animation Durations (milliseconds)
// ============================================================================

export const ANIMATION_DURATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
} as const;

// ============================================================================
// Screen Names
// ============================================================================

export const SCREEN_NAMES = {
    // Auth Screens
    LOGIN: 'Login',
    SIGNUP: 'Signup',

    // Main Tabs
    HOME: 'Home',
    FEED: 'Feed',
    LIVE_ROOMS: 'LiveRooms',
    PROFILE: 'Profile',

    // Nested Screens
    TOPIC_DETAIL: 'TopicDetail',
    CREATE_TOPIC: 'CreateTopic',
    VOICE_ROOM: 'VoiceRoom',
    CALL: 'Call',
    INCOMING_CALL: 'IncomingCall',
    USER_PROFILE: 'UserProfile',
    SETTINGS: 'Settings',
    NOTIFICATIONS: 'Notifications',
    CLUBS: 'Clubs',
} as const;

// ============================================================================
// Permission Request Messages
// ============================================================================

export const PERMISSION_MESSAGES = {
    MICROPHONE: {
        title: 'Microphone Permission Required',
        message: 'VoiceSphere needs access to your microphone to enable voice conversations.',
    },
    NOTIFICATIONS: {
        title: 'Notification Permission',
        message: 'Enable notifications to receive incoming call alerts and updates.',
    },
    CONTACTS: {
        title: 'Contacts Permission',
        message: 'Access your contacts to find friends on VoiceSphere.',
    },
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    AUTHENTICATION_ERROR: 'Authentication failed. Please login again.',
    PERMISSION_DENIED: 'Permission denied. Please grant the required permissions.',
    WEBRTC_FAILED: 'Failed to establish voice connection. Please try again.',
    INVALID_INPUT: 'Invalid input. Please check your data.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// ============================================================================
// Topic Categories
// ============================================================================

export const TOPIC_CATEGORIES = {
    WAKE_UP: 'wake-up',
    QUESTION: 'question',
    RANDOM: 'random',
    INTERESTING: 'interesting',
    ANNOUNCEMENT: 'announcement',
    DISCUSSION: 'discussion',
} as const;

export const TOPIC_CATEGORY_LABELS = {
    [TOPIC_CATEGORIES.WAKE_UP]: 'Wake-up',
    [TOPIC_CATEGORIES.QUESTION]: 'Question',
    [TOPIC_CATEGORIES.RANDOM]: 'Random',
    [TOPIC_CATEGORIES.INTERESTING]: 'Interesting',
    [TOPIC_CATEGORIES.ANNOUNCEMENT]: 'Announcement',
    [TOPIC_CATEGORIES.DISCUSSION]: 'Discussion',
} as const;

// ============================================================================
// App Configuration
// ============================================================================

export const APP_CONFIG = {
    NAME: 'VoiceSphere',
    VERSION: '1.0.0',
    BUILD_NUMBER: 1,
    SUPPORT_EMAIL: 'support@voicesphere.app',
    PRIVACY_POLICY_URL: 'https://voicesphere.app/privacy',
    TERMS_OF_SERVICE_URL: 'https://voicesphere.app/terms',
} as const;

// ============================================================================
// Deep Link Configuration
// ============================================================================

export const DEEP_LINKS = {
    SCHEME: 'voicesphere://',
    PREFIXES: ['voicesphere://', 'https://voicesphere.app'],
    PATHS: {
        ROOM: 'room/:roomId',
        TOPIC: 'topic/:topicId',
        USER: 'user/:userId',
        CALL: 'call/:callId',
    },
} as const;
