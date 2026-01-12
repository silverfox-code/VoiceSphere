/**
 * Common TypeScript types used across the VoiceSphere application
 * @module @commonTypes
 */

// ============================================================================
// Base Types
// ============================================================================

export type UUID = string;
export type Timestamp = number;
export type ISODateString = string;

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
    timestamp: Timestamp;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: PaginationMeta;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack?: string;
}

// ============================================================================
// Base Entity Types
// ============================================================================

export interface BaseEntity {
    id: UUID;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface SoftDeletableEntity extends BaseEntity {
    deletedAt?: ISODateString;
    isDeleted: boolean;
}

// ============================================================================
// WebSocket Types
// ============================================================================

export enum WebSocketEventType {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    ERROR = 'error',
    RECONNECT = 'reconnect',
    ROOM_JOIN = 'room:join',
    ROOM_LEAVE = 'room:leave',
    ROOM_UPDATE = 'room:update',
    MESSAGE = 'message',
    USER_JOINED = 'user:joined',
    USER_LEFT = 'user:left',
    SPEAKING_STARTED = 'speaking:started',
    SPEAKING_STOPPED = 'speaking:stopped',
    TOPIC_CREATED = 'topic:created',
    TOPIC_UPDATED = 'topic:updated',
}

export interface WebSocketMessage<T = any> {
    event: WebSocketEventType;
    data: T;
    timestamp: Timestamp;
    id: UUID;
}

export interface WebSocketConnectionStatus {
    isConnected: boolean;
    reconnectAttempts: number;
    lastConnectedAt?: Timestamp;
    lastDisconnectedAt?: Timestamp;
}

// ============================================================================
// Media & Call Types
// ============================================================================

export enum MediaType {
    AUDIO = 'audio',
    VIDEO = 'video',
}

export enum CallState {
    IDLE = 'idle',
    INCOMING = 'incoming',
    OUTGOING = 'outgoing',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    DISCONNECTING = 'disconnecting',
    DISCONNECTED = 'disconnected',
    FAILED = 'failed',
}

export enum AudioRoute {
    EARPIECE = 'earpiece',
    SPEAKER = 'speaker',
    BLUETOOTH = 'bluetooth',
    HEADPHONES = 'headphones',
}

export interface MediaConstraints {
    audio: boolean | MediaTrackConstraints;
    video: boolean | MediaTrackConstraints;
}

export interface MediaTrackConstraints {
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
    sampleRate?: number;
    channelCount?: number;
}

// ============================================================================
// Network Quality Types
// ============================================================================

export enum NetworkQuality {
    EXCELLENT = 'excellent',
    GOOD = 'good',
    FAIR = 'fair',
    POOR = 'poor',
    CRITICAL = 'critical',
}

export interface NetworkStats {
    quality: NetworkQuality;
    latency: number; // ms
    jitter: number; // ms
    packetLoss: number; // percentage
    bandwidth: number; // kbps
}

// ============================================================================
// User Presence Types
// ============================================================================

export enum UserPresenceStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    AWAY = 'away',
    BUSY = 'busy',
    IN_CALL = 'in_call',
}

export interface UserPresence {
    userId: UUID;
    status: UserPresenceStatus;
    lastSeenAt: Timestamp;
    currentRoomId?: UUID;
}

// ============================================================================
// Permission Types
// ============================================================================

export enum PermissionType {
    MICROPHONE = 'microphone',
    CAMERA = 'camera',
    NOTIFICATIONS = 'notifications',
    CONTACTS = 'contacts',
    STORAGE = 'storage',
}

export enum PermissionStatus {
    GRANTED = 'granted',
    DENIED = 'denied',
    BLOCKED = 'blocked',
    UNDETERMINED = 'undetermined',
}

export interface PermissionResult {
    type: PermissionType;
    status: PermissionStatus;
    canAskAgain: boolean;
}

// ============================================================================
// Analytics Event Types
// ============================================================================

export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
    timestamp: Timestamp;
    userId?: UUID;
    sessionId?: UUID;
}

export enum AnalyticsEventName {
    // Auth Events
    USER_LOGIN = 'user_login',
    USER_LOGOUT = 'user_logout',
    USER_SIGNUP = 'user_signup',

    // Topic Events
    TOPIC_CREATED = 'topic_created',
    TOPIC_VIEWED = 'topic_viewed',
    TOPIC_JOINED = 'topic_joined',

    // Room Events
    ROOM_JOINED = 'room_joined',
    ROOM_LEFT = 'room_left',
    ROOM_CREATED = 'room_created',

    // Call Events
    CALL_INITIATED = 'call_initiated',
    CALL_ACCEPTED = 'call_accepted',
    CALL_REJECTED = 'call_rejected',
    CALL_ENDED = 'call_ended',

    // Interaction Events
    BUTTON_CLICKED = 'button_clicked',
    SCREEN_VIEWED = 'screen_viewed',
    FEATURE_USED = 'feature_used',
}

// ============================================================================
// Storage Types
// ============================================================================

export enum StorageKey {
    AUTH_TOKEN = '@voicesphere:auth_token',
    USER_DATA = '@voicesphere:user_data',
    USER_PREFERENCES = '@voicesphere:user_preferences',
    CACHED_TOPICS = '@voicesphere:cached_topics',
    LAST_SYNC = '@voicesphere:last_sync',
    FCM_TOKEN = '@voicesphere:fcm_token',
    ONBOARDING_COMPLETED = '@voicesphere:onboarding_completed',
}

// ============================================================================
// Error Types
// ============================================================================

export enum ErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    WEBRTC_ERROR = 'WEBRTC_ERROR',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export class AppError extends Error {
    code: ErrorCode;
    details?: Record<string, any>;

    constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
    }
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T>;
export type Callback<T = void> = () => T;
export type AsyncCallback<T = void> = () => Promise<T>;

// ============================================================================
// Environment Types
// ============================================================================

export enum Environment {
    DEVELOPMENT = 'development',
    STAGING = 'staging',
    PRODUCTION = 'production',
}

export interface EnvironmentConfig {
    env: Environment;
    apiBaseUrl: string;
    wsBaseUrl: string;
    apiTimeout: number;
    enableLogging: boolean;
    enableAnalytics: boolean;
}
