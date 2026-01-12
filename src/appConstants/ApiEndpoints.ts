/**
 * API Configuration Constants
 */

// API Base URLs
export const API_BASE_URL = __DEV__
    ? 'http://localhost:8080/api'
    : 'https://api.voicesphere.com';

export const WS_BASE_URL = __DEV__
    ? 'ws://localhost:8080/ws'
    : 'wss://api.voicesphere.com/ws';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh',
        VERIFY_EMAIL: '/auth/verify-email',
    },
    // User
    USER: {
        PROFILE: '/user/profile',
        UPDATE_PROFILE: '/user/profile',
        UPLOAD_AVATAR: '/user/avatar',
    },
    // Topics
    TOPICS: {
        LIST: '/topics',
        DETAIL: (id: string) => `/topics/${id}`,
        CREATE: '/topics',
        UPDATE: (id: string) => `/topics/${id}`,
        DELETE: (id: string) => `/topics/${id}`,
    },
    // Clubs
    CLUBS: {
        LIST: '/clubs',
        DETAIL: (id: string) => `/clubs/${id}`,
        CREATE: '/clubs',
        JOIN: (id: string) => `/clubs/${id}/join`,
        LEAVE: (id: string) => `/clubs/${id}/leave`,
    },
} as const;
