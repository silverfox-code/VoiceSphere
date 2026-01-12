/**
 * Voice Room Store
 * Manages voice room state and participants
 * @module @stores/roomStore
 */

import { create } from 'zustand';
import { UUID, NetworkQuality } from '@commonTypes';
import { logger } from '@logger';

// ============================================================================
// Types
// ============================================================================

export enum ParticipantRole {
    HOST = 'host',
    MODERATOR = 'moderator',
    SPEAKER = 'speaker',
    LISTENER = 'listener',
}

export interface Participant {
    id: UUID;
    userId: UUID;
    username: string;
    avatar?: string;
    role: ParticipantRole;
    isMuted: boolean;
    isSpeaking: boolean;
    hasHandRaised: boolean;
    joinedAt: string;
    networkQuality: NetworkQuality;
}

export interface VoiceRoom {
    id: UUID;
    topicId?: UUID;
    topic: string;
    hostId: UUID;
    participants: Participant[];
    maxParticipants: number;
    isActive: boolean;
    createdAt: string;
}

export interface RoomState {
    // State
    currentRoom: VoiceRoom | null;
    isJoined: boolean;
    isConnecting: boolean;
    isMuted: boolean;
    isSpeakerMode: boolean; // true = speaker, false = earpiece
    networkQuality: NetworkQuality;
    error: string | null;

    // Actions
    setCurrentRoom: (room: VoiceRoom | null) => void;
    joinRoom: (room: VoiceRoom) => void;
    leaveRoom: () => void;
    setConnecting: (isConnecting: boolean) => void;
    setMuted: (isMuted: boolean) => void;
    toggleMute: () => void;
    setSpeakerMode: (isSpeakerMode: boolean) => void;
    toggleSpeakerMode: () => void;
    setNetworkQuality: (quality: NetworkQuality) => void;
    setError: (error: string | null) => void;

    // Participant Management
    addParticipant: (participant: Participant) => void;
    removeParticipant: (participantId: UUID) => void;
    updateParticipant: (participantId: UUID, updates: Partial<Participant>) => void;
    setParticipantSpeaking: (participantId: UUID, isSpeaking: boolean) => void;
    setParticipantMuted: (participantId: UUID, isMuted: boolean) => void;
    setParticipantHandRaised: (participantId: UUID, hasHandRaised: boolean) => void;
    updateParticipantNetworkQuality: (participantId: UUID, quality: NetworkQuality) => void;

    // Helpers
    getParticipantById: (participantId: UUID) => Participant | undefined;
    getActiveSpeakers: () => Participant[];
    getRaisedHands: () => Participant[];
    reset: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useRoomStore = create<RoomState>((set, get) => ({
    // Initial State
    currentRoom: null,
    isJoined: false,
    isConnecting: false,
    isMuted: false,
    isSpeakerMode: false,
    networkQuality: NetworkQuality.GOOD,
    error: null,

    // Actions
    setCurrentRoom: (room) => {
        logger.debug('Setting current room', 'RoomStore', { roomId: room?.id });
        set({ currentRoom: room });
    },

    joinRoom: (room) => {
        logger.info('Joining room', 'RoomStore', { roomId: room.id, topic: room.topic });
        set({
            currentRoom: room,
            isJoined: true,
            isConnecting: false,
            error: null,
        });
    },

    leaveRoom: () => {
        const roomId = get().currentRoom?.id;
        logger.info('Leaving room', 'RoomStore', { roomId });
        set({
            currentRoom: null,
            isJoined: false,
            isConnecting: false,
            isMuted: false,
            error: null,
        });
    },

    setConnecting: (isConnecting) => {
        set({ isConnecting });
    },

    setMuted: (isMuted) => {
        logger.debug('Setting mute status', 'RoomStore', { isMuted });
        set({ isMuted });
    },

    toggleMute: () => {
        const newMuted = !get().isMuted;
        logger.debug('Toggling mute', 'RoomStore', { isMuted: newMuted });
        set({ isMuted: newMuted });
    },

    setSpeakerMode: (isSpeakerMode) => {
        logger.debug('Setting speaker mode', 'RoomStore', { isSpeakerMode });
        set({ isSpeakerMode });
    },

    toggleSpeakerMode: () => {
        const newSpeakerMode = !get().isSpeakerMode;
        logger.debug('Toggling speaker mode', 'RoomStore', { isSpeakerMode: newSpeakerMode });
        set({ isSpeakerMode: newSpeakerMode });
    },

    setNetworkQuality: (networkQuality) => {
        if (get().networkQuality !== networkQuality) {
            logger.debug('Network quality changed', 'RoomStore', { quality: networkQuality });
            set({ networkQuality });
        }
    },

    setError: (error) => {
        if (error) {
            logger.error('Room error', new Error(error), 'RoomStore');
        }
        set({ error });
    },

    // Participant Management
    addParticipant: (participant) => {
        logger.debug('Adding participant', 'RoomStore', {
            participantId: participant.id,
            username: participant.username
        });
        set((state) => {
            if (!state.currentRoom) return state;

            return {
                currentRoom: {
                    ...state.currentRoom,
                    participants: [...state.currentRoom.participants, participant],
                },
            };
        });
    },

    removeParticipant: (participantId) => {
        logger.debug('Removing participant', 'RoomStore', { participantId });
        set((state) => {
            if (!state.currentRoom) return state;

            return {
                currentRoom: {
                    ...state.currentRoom,
                    participants: state.currentRoom.participants.filter(
                        (p) => p.id !== participantId
                    ),
                },
            };
        });
    },

    updateParticipant: (participantId, updates) => {
        logger.debug('Updating participant', 'RoomStore', { participantId, updates });
        set((state) => {
            if (!state.currentRoom) return state;

            return {
                currentRoom: {
                    ...state.currentRoom,
                    participants: state.currentRoom.participants.map((p) =>
                        p.id === participantId ? { ...p, ...updates } : p
                    ),
                },
            };
        });
    },

    setParticipantSpeaking: (participantId, isSpeaking) => {
        get().updateParticipant(participantId, { isSpeaking });
    },

    setParticipantMuted: (participantId, isMuted) => {
        get().updateParticipant(participantId, { isMuted });
    },

    setParticipantHandRaised: (participantId, hasHandRaised) => {
        logger.debug('Setting hand raised status', 'RoomStore', {
            participantId,
            hasHandRaised
        });
        get().updateParticipant(participantId, { hasHandRaised });
    },

    updateParticipantNetworkQuality: (participantId, quality) => {
        get().updateParticipant(participantId, { networkQuality: quality });
    },

    // Helpers
    getParticipantById: (participantId) => {
        return get().currentRoom?.participants.find((p) => p.id === participantId);
    },

    getActiveSpeakers: () => {
        return get().currentRoom?.participants.filter((p) => p.isSpeaking) || [];
    },

    getRaisedHands: () => {
        return get().currentRoom?.participants.filter((p) => p.hasHandRaised) || [];
    },

    reset: () => {
        logger.debug('Resetting room store', 'RoomStore');
        set({
            currentRoom: null,
            isJoined: false,
            isConnecting: false,
            isMuted: false,
            isSpeakerMode: false,
            networkQuality: NetworkQuality.GOOD,
            error: null,
        });
    },
}));

// ============================================================================
// Selectors
// ============================================================================

export const selectCurrentRoom = (state: RoomState) => state.currentRoom;
export const selectIsJoined = (state: RoomState) => state.isJoined;
export const selectParticipants = (state: RoomState) => state.currentRoom?.participants || [];
export const selectParticipantCount = (state: RoomState) =>
    state.currentRoom?.participants.length || 0;
export const selectActiveSpeakers = (state: RoomState) => state.getActiveSpeakers();
export const selectRaisedHands = (state: RoomState) => state.getRaisedHands();
export const selectIsMuted = (state: RoomState) => state.isMuted;
export const selectIsSpeakerMode = (state: RoomState) => state.isSpeakerMode;
export const selectNetworkQuality = (state: RoomState) => state.networkQuality;
