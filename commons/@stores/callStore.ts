/**
 * Call Store
 * Manages 1-on-1 call state and lifecycle
 * @module @stores/callStore
 */

import { create } from 'zustand';
import { UUID, CallState, AudioRoute } from '@commonTypes';
import { logger } from '@logger';

// ============================================================================
// Types
// ============================================================================

export interface CallParticipant {
    id: UUID;
    username: string;
    avatar?: string;
}

export interface Call {
    id: UUID;
    caller: CallParticipant;
    callee: CallParticipant;
    state: CallState;
    startTime?: number;
    endTime?: number;
    duration?: number; // in seconds
    isIncoming: boolean;
}

export interface CallStoreState {
    // State
    currentCall: Call | null;
    isMuted: boolean;
    audioRoute: AudioRoute;
    callDuration: number; // in seconds
    error: string | null;

    // Actions
    initiateCall: (caller: CallParticipant, callee: CallParticipant) => void;
    receiveCall: (caller: CallParticipant, callee: CallParticipant, callId: UUID) => void;
    acceptCall: () => void;
    rejectCall: () => void;
    endCall: () => void;
    setCallState: (state: CallState) => void;
    setMuted: (isMuted: boolean) => void;
    toggleMute: () => void;
    setAudioRoute: (route: AudioRoute) => void;
    setCallDuration: (duration: number) => void;
    incrementCallDuration: () => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useCallStore = create<CallStoreState>((set, get) => ({
    // Initial State
    currentCall: null,
    isMuted: false,
    audioRoute: AudioRoute.EARPIECE,
    callDuration: 0,
    error: null,

    // Actions
    initiateCall: (caller, callee) => {
        const callId = `call_${Date.now()}`;
        logger.info('Initiating call', 'CallStore', {
            callId,
            callerId: caller.id,
            calleeId: callee.id,
        });

        set({
            currentCall: {
                id: callId,
                caller,
                callee,
                state: CallState.OUTGOING,
                isIncoming: false,
            },
            callDuration: 0,
            error: null,
        });
    },

    receiveCall: (caller, callee, callId) => {
        logger.info('Receiving call', 'CallStore', {
            callId,
            callerId: caller.id,
            calleeId: callee.id,
        });

        set({
            currentCall: {
                id: callId,
                caller,
                callee,
                state: CallState.INCOMING,
                isIncoming: true,
            },
            callDuration: 0,
            error: null,
        });
    },

    acceptCall: () => {
        const call = get().currentCall;
        if (!call) return;

        logger.info('Accepting call', 'CallStore', { callId: call.id });

        set((state) => ({
            currentCall: state.currentCall
                ? {
                    ...state.currentCall,
                    state: CallState.CONNECTING,
                    startTime: Date.now(),
                }
                : null,
        }));
    },

    rejectCall: () => {
        const call = get().currentCall;
        if (!call) return;

        logger.info('Rejecting call', 'CallStore', { callId: call.id });

        set({
            currentCall: null,
            callDuration: 0,
            isMuted: false,
        });
    },

    endCall: () => {
        const call = get().currentCall;
        if (!call) return;

        const duration = get().callDuration;
        logger.info('Ending call', 'CallStore', { callId: call.id, duration });

        set((state) => ({
            currentCall: state.currentCall
                ? {
                    ...state.currentCall,
                    state: CallState.DISCONNECTED,
                    endTime: Date.now(),
                    duration: state.callDuration,
                }
                : null,
        }));

        // Clear call after a short delay to show end state
        setTimeout(() => {
            get().reset();
        }, 2000);
    },

    setCallState: (state) => {
        const call = get().currentCall;
        if (!call) return;

        logger.debug('Setting call state', 'CallStore', {
            callId: call.id,
            state
        });

        set((prevState) => ({
            currentCall: prevState.currentCall
                ? {
                    ...prevState.currentCall,
                    state,
                    ...(state === CallState.CONNECTED && !prevState.currentCall.startTime
                        ? { startTime: Date.now() }
                        : {}),
                }
                : null,
        }));
    },

    setMuted: (isMuted) => {
        logger.debug('Setting mute status', 'CallStore', { isMuted });
        set({ isMuted });
    },

    toggleMute: () => {
        const newMuted = !get().isMuted;
        logger.debug('Toggling mute', 'CallStore', { isMuted: newMuted });
        set({ isMuted: newMuted });
    },

    setAudioRoute: (audioRoute) => {
        logger.debug('Setting audio route', 'CallStore', { audioRoute });
        set({ audioRoute });
    },

    setCallDuration: (callDuration) => {
        set({ callDuration });
    },

    incrementCallDuration: () => {
        set((state) => ({
            callDuration: state.callDuration + 1,
        }));
    },

    setError: (error) => {
        if (error) {
            logger.error('Call error', new Error(error), 'CallStore');
        }
        set({ error });
    },

    reset: () => {
        logger.debug('Resetting call store', 'CallStore');
        set({
            currentCall: null,
            isMuted: false,
            audioRoute: AudioRoute.EARPIECE,
            callDuration: 0,
            error: null,
        });
    },
}));

// ============================================================================
// Selectors
// ============================================================================

export const selectCurrentCall = (state: CallStoreState) => state.currentCall;
export const selectCallState = (state: CallStoreState) => state.currentCall?.state;
export const selectIsInCall = (state: CallStoreState) =>
    state.currentCall !== null &&
    state.currentCall.state !== CallState.DISCONNECTED &&
    state.currentCall.state !== CallState.FAILED;
export const selectIsIncomingCall = (state: CallStoreState) =>
    state.currentCall?.state === CallState.INCOMING;
export const selectIsMuted = (state: CallStoreState) => state.isMuted;
export const selectAudioRoute = (state: CallStoreState) => state.audioRoute;
export const selectCallDuration = (state: CallStoreState) => state.callDuration;
