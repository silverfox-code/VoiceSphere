/**
 * Application-wide Enums
 */

export enum UserRole {
    USER = 'user',
    MODERATOR = 'moderator',
    ADMIN = 'admin',
}

export enum TopicStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    ENDED = 'ended',
    ARCHIVED = 'archived',
}

export enum CallStatus {
    IDLE = 'idle',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    FAILED = 'failed',
}

export enum NotificationType {
    TOPIC_INVITE = 'topic_invite',
    TOPIC_START = 'topic_start',
    CLUB_INVITE = 'club_invite',
    COMMENT = 'comment',
    REACTION = 'reaction',
    MENTION = 'mention',
    SYSTEM = 'system',
}

export enum WebSocketEventType {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    ERROR = 'error',
    MESSAGE = 'message',
    TOPIC_UPDATE = 'topic_update',
    USER_JOIN = 'user_join',
    USER_LEAVE = 'user_leave',
}
