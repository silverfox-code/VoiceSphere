/**
 * Audio Manager Service
 * Manages audio routing, speaker/earpiece, and proximity sensor
 * @module @services/AudioManagerService
 */

import { NativeModules, Platform } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { AudioRoute } from '@commonTypes';
import { logger } from '@logger';

class AudioManagerService {
    private static instance: AudioManagerService;
    private isStarted: boolean = false;
    private currentRoute: AudioRoute = AudioRoute.EARPIECE;
    private isMuted: boolean = false;

    private constructor() { }

    static getInstance(): AudioManagerService {
        if (!AudioManagerService.instance) {
            AudioManagerService.instance = new AudioManagerService();
        }
        return AudioManagerService.instance;
    }

    /**
     * Start audio session for voice call
     */
    async start(options?: {
        media?: 'audio' | 'video';
        auto?: boolean;
        ringback?: string;
    }): Promise<void> {
        try {
            logger.info('Starting audio session', 'AudioManagerService', options);

            await InCallManager.start({
                media: options?.media || 'audio',
                auto: options?.auto !== undefined ? options.auto : true,
                ringback: options?.ringback || '',
            });

            // Enable proximity sensor (screen off when near ear)
            InCallManager.setProximityScreenOff(true);

            this.isStarted = true;
            this.currentRoute = AudioRoute.EARPIECE;

            logger.info('Audio session started', 'AudioManagerService');
        } catch (error) {
            logger.error('Failed to start audio session', error as Error, 'AudioManagerService');
            throw error;
        }
    }

    /**
     * Stop audio session
     */
    async stop(): Promise<void> {
        try {
            if (!this.isStarted) {
                logger.warn('Audio session not started', 'AudioManagerService');
                return;
            }

            logger.info('Stopping audio session', 'AudioManagerService');

            await InCallManager.stop();

            // Disable proximity sensor
            InCallManager.setProximityScreenOff(false);

            this.isStarted = false;
            this.currentRoute = AudioRoute.EARPIECE;
            this.isMuted = false;

            logger.info('Audio session stopped', 'AudioManagerService');
        } catch (error) {
            logger.error('Failed to stop audio session', error as Error, 'AudioManagerService');
        }
    }

    /**
     * Set speakerphone on/off
     */
    async setSpeakerphoneOn(enabled: boolean): Promise<void> {
        try {
            logger.debug('Setting speakerphone', 'AudioManagerService', { enabled });

            if (enabled) {
                await InCallManager.setForceSpeakerphoneOn(true);
                this.currentRoute = AudioRoute.SPEAKER;
            } else {
                await InCallManager.setForceSpeakerphoneOn(false);
                this.currentRoute = AudioRoute.EARPIECE;
            }

            logger.debug('Speakerphone set', 'AudioManagerService', {
                enabled,
                route: this.currentRoute,
            });
        } catch (error) {
            logger.error('Failed to set speakerphone', error as Error, 'AudioManagerService');
            throw error;
        }
    }

    /**
     * Toggle speaker mode
     */
    async toggleSpeaker(): Promise<boolean> {
        const newState = this.currentRoute !== AudioRoute.SPEAKER;
        await this.setSpeakerphoneOn(newState);
        return newState;
    }

    /**
     * Get current speaker state
     */
    isSpeakerOn(): boolean {
        return this.currentRoute === AudioRoute.SPEAKER;
    }

    /**
     * Set microphone mute
     */
    async setMicrophoneMute(muted: boolean): Promise<void> {
        try {
            logger.debug('Setting microphone mute', 'AudioManagerService', { muted });

            await InCallManager.setMicrophoneMute(muted);
            this.isMuted = muted;

            logger.debug('Microphone mute set', 'AudioManagerService', { muted });
        } catch (error) {
            logger.error('Failed to set microphone mute', error as Error, 'AudioManagerService');
            throw error;
        }
    }

    /**
     * Toggle microphone mute
     */
    async toggleMute(): Promise<boolean> {
        const newState = !this.isMuted;
        await this.setMicrophoneMute(newState);
        return newState;
    }

    /**
     * Get current mute state
     */
    isMicrophoneMuted(): boolean {
        return this.isMuted;
    }

    /**
     * Start ringtone
     */
    async startRingtone(ringtone?: string): Promise<void> {
        try {
            logger.debug('Starting ringtone', 'AudioManagerService', { ringtone });
            await InCallManager.startRingtone(ringtone || '_DEFAULT_');
        } catch (error) {
            logger.error('Failed to start ringtone', error as Error, 'AudioManagerService');
        }
    }

    /**
     * Stop ringtone
     */
    async stopRingtone(): Promise<void> {
        try {
            logger.debug('Stopping ringtone', 'AudioManagerService');
            await InCallManager.stopRingtone();
        } catch (error) {
            logger.error('Failed to stop ringtone', error as Error, 'AudioManagerService');
        }
    }

    /**
     * Start ringback tone (outgoing call sound)
     */
    async startRingback(): Promise<void> {
        try {
            logger.debug('Starting ringback', 'AudioManagerService');
            await InCallManager.startRingback();
        } catch (error) {
            logger.error('Failed to start ringback', error as Error, 'AudioManagerService');
        }
    }

    /**
     * Stop ringback tone
     */
    async stopRingback(): Promise<void> {
        try {
            logger.debug('Stopping ringback', 'AudioManagerService');
            await InCallManager.stopRingback();
        } catch (error) {
            logger.error('Failed to stop ringback', error as Error, 'AudioManagerService');
        }
    }

    /**
     * Get current audio route
     */
    getCurrentRoute(): AudioRoute {
        return this.currentRoute;
    }

    /**
     * Check if audio session is active
     */
    isActive(): boolean {
        return this.isStarted;
    }

    /**
     * Reset audio manager
     */
    reset(): void {
        logger.debug('Resetting audio manager', 'AudioManagerService');
        this.isStarted = false;
        this.currentRoute = AudioRoute.EARPIECE;
        this.isMuted = false;
    }
}

export const audioManagerService = AudioManagerService.getInstance();
