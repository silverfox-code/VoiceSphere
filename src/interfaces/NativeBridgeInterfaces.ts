/**
 * Native Bridge Interfaces
 * Type-safe interfaces for communication between React Native and Native Modules
 * @module @interfaces/NativeBridgeInterfaces
 */

import { UUID, CallState, AudioRoute, NetworkQuality } from '@commonTypes';
import {
    RTCIceServer,
    RTCBundlePolicy,
    RTCRtcpMuxPolicy,
    RTCPeerConnectionState,
    RTCIceConnectionState,
    RTCIceGatheringState,
    RTCSignalingState,
    RTCOfferOptions,
    RTCAnswerOptions,
    MediaStreamConstraints,
    MediaStream,
} from 'react-native-webrtc';

// ============================================================================
// WebRTC Bridge Interface
// ============================================================================

export interface WebRTCPeerConfig {
    iceServers: RTCIceServer[];
    iceCandidatePoolSize?: number;
    bundlePolicy?: RTCBundlePolicy;
    rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

export interface WebRTCOffer {
    type: 'offer';
    sdp: string;
}

export interface WebRTCAnswer {
    type: 'answer';
    sdp: string;
}

export interface WebRTCIceCandidate {
    candidate: string;
    sdpMid: string | null;
    sdpMLineIndex: number | null;
}

export interface WebRTCConnectionState {
    connectionState: RTCPeerConnectionState;
    iceConnectionState: RTCIceConnectionState;
    iceGatheringState: RTCIceGatheringState;
    signalingState: RTCSignalingState;
}

/**
 * Native WebRTC Module Interface
 * All WebRTC operations MUST go through this typed interface
 */
export interface IWebRTCNativeModule {
    /**
     * Initialize WebRTC peer connection
     */
    createPeerConnection(
        connectionId: UUID,
        config: WebRTCPeerConfig,
    ): Promise<void>;

    /**
     * Create an offer for peer connection
     */
    createOffer(
        connectionId: UUID,
        constraints?: RTCOfferOptions,
    ): Promise<WebRTCOffer>;

    /**
     * Create an answer for peer connection
     */
    createAnswer(
        connectionId: UUID,
        constraints?: RTCAnswerOptions,
    ): Promise<WebRTCAnswer>;

    /**
     * Set local description
     */
    setLocalDescription(
        connectionId: UUID,
        description: WebRTCOffer | WebRTCAnswer,
    ): Promise<void>;

    /**
     * Set remote description
     */
    setRemoteDescription(
        connectionId: UUID,
        description: WebRTCOffer | WebRTCAnswer,
    ): Promise<void>;

    /**
     * Add ICE candidate
     */
    addIceCandidate(
        connectionId: UUID,
        candidate: WebRTCIceCandidate,
    ): Promise<void>;

    /**
     * Get user media (audio/video)
     */
    getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;

    /**
     * Add local stream to peer connection
     */
    addStream(connectionId: UUID, stream: MediaStream): Promise<void>;

    /**
     * Remove stream from peer connection
     */
    removeStream(connectionId: UUID, streamId: string): Promise<void>;

    /**
     * Close peer connection
     */
    closePeerConnection(connectionId: UUID): Promise<void>;

    /**
     * Get connection statistics
     */
    getStats(connectionId: UUID): Promise<RTCStatsReport>;

    /**
     * Get current connection state
     */
    getConnectionState(connectionId: UUID): Promise<WebRTCConnectionState>;

    /**
     * Event listeners
     */
    onIceCandidate(
        connectionId: UUID,
        callback: (candidate: WebRTCIceCandidate) => void,
    ): () => void;

    onIceConnectionStateChange(
        connectionId: UUID,
        callback: (state: RTCIceConnectionState) => void,
    ): () => void;

    onConnectionStateChange(
        connectionId: UUID,
        callback: (state: RTCPeerConnectionState) => void,
    ): () => void;

    onAddStream(
        connectionId: UUID,
        callback: (stream: MediaStream) => void,
    ): () => void;

    onRemoveStream(
        connectionId: UUID,
        callback: (streamId: string) => void,
    ): () => void;
}

// ============================================================================
// Audio Manager Bridge Interface
// ============================================================================

export interface AudioConfiguration {
    enableEchoCancellation: boolean;
    enableNoiseSuppression: boolean;
    enableAutoGainControl: boolean;
    sampleRate: number;
    channelCount: number;
}

/**
 * Native Audio Manager Interface
 * Handles audio routing, proximity sensor, and speaker control
 */
export interface IAudioManagerNativeModule {
    /**
     * Start audio session
     */
    start(configuration?: AudioConfiguration): Promise<void>;

    /**
     * Stop audio session
     */
    stop(): Promise<void>;

    /**
     * Set audio route
     */
    setAudioRoute(route: AudioRoute): Promise<void>;

    /**
     * Get current audio route
     */
    getAudioRoute(): Promise<AudioRoute>;

    /**
     * Enable/disable speaker
     */
    setSpeakerphoneOn(enabled: boolean): Promise<void>;

    /**
     * Check if speakerphone is on
     */
    isSpeakerphoneOn(): Promise<boolean>;

    /**
     * Mute/unmute microphone
     */
    setMicrophoneMute(muted: boolean): Promise<void>;

    /**
     * Check if microphone is muted
     */
    isMicrophoneMuted(): Promise<boolean>;

    /**
     * Enable proximity sensor (screen off when near ear)
     */
    setProximityScreenOff(enabled: boolean): Promise<void>;

    /**
     * Set audio mode (call, normal, etc.)
     */
    setAudioMode(mode: 'call' | 'normal' | 'ringtone'): Promise<void>;

    /**
     * Event listeners
     */
    onAudioRouteChanged(callback: (route: AudioRoute) => void): () => void;

    onAudioFocusChanged(callback: (hasFocus: boolean) => void): () => void;
}

// ============================================================================
// Call Notification Bridge Interface
// ============================================================================

export interface IncomingCallData {
    callId: UUID;
    callerId: UUID;
    callerName: string;
    callerAvatar?: string;
    timestamp: number;
}

export interface CallNotificationAction {
    id: 'accept' | 'reject';
    title: string;
    icon?: string;
}

/**
 * Native Call Notification Interface
 * Handles incoming call notifications and full-screen UI
 */
export interface ICallNotificationNativeModule {
    /**
     * Display incoming call notification (with ringtone and vibration)
     */
    displayIncomingCall(callData: IncomingCallData): Promise<void>;

    /**
     * Hide incoming call notification
     */
    hideIncomingCall(callId: UUID): Promise<void>;

    /**
     * Start ringtone
     */
    startRingtone(): Promise<void>;

    /**
     * Stop ringtone
     */
    stopRingtone(): Promise<void>;

    /**
     * Start vibration
     */
    startVibration(): Promise<void>;

    /**
     * Stop vibration
     */
    stopVibration(): Promise<void>;

    /**
     * Show full-screen incoming call UI (even when locked)
     */
    showFullScreenIncomingCall(callData: IncomingCallData): Promise<void>;

    /**
     * Hide full-screen incoming call UI
     */
    hideFullScreenIncomingCall(): Promise<void>;

    /**
     * Event listeners
     */
    onCallAccepted(callback: (callId: UUID) => void): () => void;

    onCallRejected(callback: (callId: UUID) => void): () => void;

    onCallMissed(callback: (callId: UUID) => void): () => void;
}

// ============================================================================
// Background Service Bridge Interface
// ============================================================================

export interface BackgroundTaskConfig {
    taskId: string;
    taskTitle: string;
    taskDescription: string;
    enableWifiLock?: boolean;
    enableWakeLock?: boolean;
}

/**
 * Native Background Service Interface
 * Handles background audio and call lifecycle
 */
export interface IBackgroundServiceNativeModule {
    /**
     * Start background service
     */
    start(config: BackgroundTaskConfig): Promise<void>;

    /**
     * Stop background service
     */
    stop(taskId: string): Promise<void>;

    /**
     * Update background notification
     */
    updateNotification(taskId: string, title: string, description: string): Promise<void>;

    /**
     * Check if running in background
     */
    isRunningInBackground(): Promise<boolean>;

    /**
     * Keep screen on during call
     */
    setKeepScreenOn(enabled: boolean): Promise<void>;

    /**
     * Event listeners
     */
    onBackgroundTaskStarted(callback: (taskId: string) => void): () => void;

    onBackgroundTaskStopped(callback: (taskId: string) => void): () => void;
}

// ============================================================================
// Permission Bridge Interface
// ============================================================================

export enum NativePermission {
    MICROPHONE = 'microphone',
    CAMERA = 'camera',
    NOTIFICATIONS = 'notifications',
    PHONE_STATE = 'phone_state',
    BLUETOOTH = 'bluetooth',
}

export enum NativePermissionStatus {
    GRANTED = 'granted',
    DENIED = 'denied',
    BLOCKED = 'blocked',
    UNDETERMINED = 'undetermined',
}

export interface PermissionRequestResult {
    permission: NativePermission;
    status: NativePermissionStatus;
}

/**
 * Native Permission Interface
 */
export interface IPermissionNativeModule {
    /**
     * Check permission status
     */
    check(permission: NativePermission): Promise<NativePermissionStatus>;

    /**
     * Request permission
     */
    request(permission: NativePermission): Promise<PermissionRequestResult>;

    /**
     * Request multiple permissions
     */
    requestMultiple(
        permissions: NativePermission[],
    ): Promise<Record<NativePermission, NativePermissionStatus>>;

    /**
     * Open app settings
     */
    openSettings(): Promise<void>;
}

// ============================================================================
// Network Monitor Bridge Interface
// ============================================================================

export interface NetworkInfo {
    isConnected: boolean;
    type: 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'none';
    isInternetReachable: boolean;
    details?: {
        ssid?: string;
        strength?: number;
        ipAddress?: string;
    };
}

/**
 * Native Network Monitor Interface
 */
export interface INetworkMonitorNativeModule {
    /**
     * Get current network info
     */
    getNetworkInfo(): Promise<NetworkInfo>;

    /**
     * Start monitoring network changes
     */
    startMonitoring(): Promise<void>;

    /**
     * Stop monitoring network changes
     */
    stopMonitoring(): Promise<void>;

    /**
     * Event listeners
     */
    onNetworkStateChange(callback: (info: NetworkInfo) => void): () => void;
}

// ============================================================================
// Export All Interfaces
// ============================================================================

export type {
    MediaStream,
    RTCIceServer,
    RTCBundlePolicy,
    RTCRtcpMuxPolicy,
    RTCOfferOptions,
    RTCAnswerOptions,
    RTCStatsReport,
    RTCPeerConnectionState,
    RTCIceConnectionState,
    RTCIceGatheringState,
    RTCSignalingState,
    MediaStreamConstraints,
};
