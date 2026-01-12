/**
 * Voice Room Hook
 * Custom hook for managing voice room logic
 * @module @screens/VoiceRoom/hooks/useVoiceRoom
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { UUID, NetworkQuality } from '@commonTypes';
import { useRoomStore, Participant, ParticipantRole } from '@stores/roomStore';
import { useAuthStore } from '@stores/authStore';
import { webRTCService } from '@services/WebRTCService';
import { audioManagerService } from '@services/AudioManagerService';
import { webSocketService } from '@socket/WebSocketService';
import { WS_EVENTS } from '@constants';
import { logger } from '@logger';
import { analytics } from '@analytics/analyticsManager';

export interface UseVoiceRoomProps {
    roomId: UUID;
    topicId?: UUID;
    topic: string;
}

export const useVoiceRoom = ({ roomId, topicId, topic }: UseVoiceRoomProps) => {
    const user = useAuthStore((state) => state.user);
    const {
        currentRoom,
        isJoined,
        isConnecting,
        isMuted,
        isSpeakerMode,
        networkQuality,
        setCurrentRoom,
        joinRoom,
        leaveRoom,
        setConnecting,
        setMuted,
        toggleMute,
        setSpeakerMode,
        toggleSpeakerMode,
        setNetworkQuality,
        addParticipant,
        removeParticipant,
        setParticipantSpeaking,
        setParticipantMuted,
        setParticipantHandRaised,
    } = useRoomStore();

    const [error, setError] = useState<string | null>(null);
    const connectionIdRef = useRef<UUID>(`conn_${roomId}_${Date.now()}`);
    const joinTimeRef = useRef<number>(0);

    /**
     * Initialize voice room
     */
    const initializeRoom = useCallback(async () => {
        try {
            setConnecting(true);
            setError(null);

            logger.info('Initializing voice room', 'useVoiceRoom', { roomId, topic });

            // 1. Initialize WebSocket connection if not connected
            if (!webSocketService.isSocketConnected()) {
                logger.error(
                    'WebSocket not connected',
                    new Error('WebSocket connection required'),
                    'useVoiceRoom'
                );
                setError('Connection failed. Please try again.');
                setConnecting(false);
                return;
            }

            // 2. Start audio session
            await audioManagerService.start({ media: 'audio', auto: true });

            // 3. Initialize local media stream
            await webRTCService.initializeLocalStream(true);

            // 4. Join room via WebSocket
            webSocketService.joinRoom(roomId);

            // 5. Update room state
            joinTimeRef.current = Date.now();

            const mockRoom = {
                id: roomId,
                topicId,
                topic,
                hostId: user?.id || '',
                participants: [],
                maxParticipants: 20,
                isActive: true,
                createdAt: new Date().toISOString(),
            };

            joinRoom(mockRoom);

            // 6. Track analytics
            analytics.trackRoomJoined(roomId, 0);

            logger.info('Voice room initialized successfully', 'useVoiceRoom', { roomId });
            setConnecting(false);
        } catch (err) {
            const error = err as Error;
            logger.error('Failed to initialize voice room', error, 'useVoiceRoom', { roomId });
            setError(error.message || 'Failed to join room');
            setConnecting(false);
        }
    }, [roomId, topicId, topic, user, setConnecting, joinRoom]);

    /**
     * Leave voice room
     */
    const handleLeaveRoom = useCallback(async () => {
        try {
            logger.info('Leaving voice room', 'useVoiceRoom', { roomId });

            // Calculate duration
            const duration = joinTimeRef.current > 0
                ? Math.floor((Date.now() - joinTimeRef.current) / 1000)
                : 0;

            // 1. Leave room via WebSocket
            webSocketService.leaveRoom(roomId);

            // 2. Close WebRTC connection
            webRTCService.closePeerConnection(connectionIdRef.current);

            // 3. Stop audio session
            await audioManagerService.stop();

            // 4. Track analytics
            analytics.trackRoomLeft(roomId, duration);

            // 5. Update store
            leaveRoom();

            logger.info('Left voice room successfully', 'useVoiceRoom', { roomId, duration });
        } catch (err) {
            const error = err as Error;
            logger.error('Error leaving voice room', error, 'useVoiceRoom', { roomId });
        }
    }, [roomId, leaveRoom]);

    /**
     * Toggle mute
     */
    const handleToggleMute = useCallback(async () => {
        try {
            const newMuted = !isMuted;

            // Update local audio
            webRTCService.setLocalAudioEnabled(!newMuted);

            // Update audio manager
            await audioManagerService.setMicrophoneMute(newMuted);

            // Update store
            toggleMute();

            // Notify other participants via WebSocket
            webSocketService.send(WS_EVENTS.USER_MUTED, {
                roomId,
                userId: user?.id,
                isMuted: newMuted,
            });

            logger.debug('Toggled mute', 'useVoiceRoom', { isMuted: newMuted });
        } catch (err) {
            const error = err as Error;
            logger.error('Failed to toggle mute', error, 'useVoiceRoom');
        }
    }, [isMuted, roomId, user, toggleMute]);

    /**
     * Toggle speaker mode
     */
    const handleToggleSpeaker = useCallback(async () => {
        try {
            const newSpeakerMode = !isSpeakerMode;

            // Update audio routing
            await audioManagerService.setSpeakerphoneOn(newSpeakerMode);

            // Update store
            toggleSpeakerMode();

            logger.debug('Toggled speaker', 'useVoiceRoom', { isSpeakerMode: newSpeakerMode });
        } catch (err) {
            const error = err as Error;
            logger.error('Failed to toggle speaker', error, 'useVoiceRoom');
        }
    }, [isSpeakerMode, toggleSpeakerMode]);

    /**
     * Raise hand
     */
    const handleRaiseHand = useCallback(() => {
        webSocketService.send(WS_EVENTS.USER_HAND_RAISED, {
            roomId,
            userId: user?.id,
        });
        logger.debug('Hand raised', 'useVoiceRoom', { userId: user?.id });
    }, [roomId, user]);

    /**
     * Set up WebSocket event listeners
     */
    useEffect(() => {
        if (!isJoined) return;

        // User joined
        const unsubJoined = webSocketService.on(WS_EVENTS.USER_JOINED, (data: any) => {
            logger.debug('User joined room', 'useVoiceRoom', data);
            const participant: Participant = {
                id: data.participantId,
                userId: data.userId,
                username: data.username,
                avatar: data.avatar,
                role: data.role || ParticipantRole.LISTENER,
                isMuted: false,
                isSpeaking: false,
                hasHandRaised: false,
                joinedAt: new Date().toISOString(),
                networkQuality: NetworkQuality.GOOD,
            };
            addParticipant(participant);
        });

        // User left
        const unsubLeft = webSocketService.on(WS_EVENTS.USER_LEFT, (data: any) => {
            logger.debug('User left room', 'useVoiceRoom', data);
            removeParticipant(data.participantId);
        });

        // User speaking
        const unsubSpeaking = webSocketService.on(WS_EVENTS.USER_SPEAKING, (data: any) => {
            setParticipantSpeaking(data.participantId, data.isSpeaking);
        });

        // User muted
        const unsubMuted = webSocketService.on(WS_EVENTS.USER_MUTED, (data: any) => {
            setParticipantMuted(data.participantId, data.isMuted);
        });

        // Hand raised
        const unsubHandRaised = webSocketService.on(WS_EVENTS.USER_HAND_RAISED, (data: any) => {
            logger.debug('Hand raised', 'useVoiceRoom', data);
            setParticipantHandRaised(data.participantId, true);
        });

        return () => {
            unsubJoined();
            unsubLeft();
            unsubSpeaking();
            unsubMuted();
            unsubHandRaised();
        };
    }, [isJoined, addParticipant, removeParticipant, setParticipantSpeaking, setParticipantMuted, setParticipantHandRaised]);

    /**
     * Initialize on mount
     */
    useEffect(() => {
        initializeRoom();

        // Cleanup on unmount
        return () => {
            if (isJoined) {
                handleLeaveRoom();
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        // State
        room: currentRoom,
        participants: currentRoom?.participants || [],
        isJoined,
        isConnecting,
        isMuted,
        isSpeakerMode,
        networkQuality,
        error,

        // Actions
        leaveRoom: handleLeaveRoom,
        toggleMute: handleToggleMute,
        toggleSpeaker: handleToggleSpeaker,
        raiseHand: handleRaiseHand,
    };
};
