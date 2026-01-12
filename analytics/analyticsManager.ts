/**
 * Analytics Manager
 * Singleton manager for coordinating all analytics providers
 * @module @analytics/analyticsManager
 */

import { AnalyticsEvent, AnalyticsEventName } from '@commonTypes';
import { logger } from '@logger';
import { analyticsFactory, IAnalyticsProvider } from './analyticsFactory';
import { analyticsConfig } from './analyticsConfig';

/**
 * Analytics Manager
 * Coordinates all analytics providers and provides a unified interface
 */
class AnalyticsManager {
    private static instance: AnalyticsManager;
    private providers: IAnalyticsProvider[] = [];
    private isInitialized = false;
    private sessionId: string | null = null;
    private sessionStartTime: number | null = null;

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): AnalyticsManager {
        if (!AnalyticsManager.instance) {
            AnalyticsManager.instance = new AnalyticsManager();
        }
        return AnalyticsManager.instance;
    }

    /**
     * Initialize all analytics providers
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            logger.warn('Analytics already initialized', 'AnalyticsManager');
            return;
        }

        try {
            logger.info('Initializing analytics', 'AnalyticsManager');

            // Create providers using factory
            this.providers = analyticsFactory.createProviders();

            // Initialize all providers
            await Promise.all(
                this.providers.map((provider) =>
                    provider.initialize().catch((error) => {
                        logger.error(
                            `Failed to initialize ${provider.name}`,
                            error as Error,
                            'AnalyticsManager',
                        );
                    }),
                ),
            );

            this.isInitialized = true;
            this.startSession();

            logger.info('Analytics initialization complete', 'AnalyticsManager', {
                providerCount: this.providers.length,
            });

            // Track app open
            this.logEvent(AnalyticsEventName.SCREEN_VIEWED, {
                screen: 'AppOpen',
            });
        } catch (error) {
            logger.error('Analytics initialization failed', error as Error, 'AnalyticsManager');
        }
    }

    /**
     * Start a new analytics session
     */
    private startSession(): void {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        this.sessionStartTime = Date.now();

        logger.debug('Analytics session started', 'AnalyticsManager', {
            sessionId: this.sessionId,
        });

        // Auto-end session after timeout
        setTimeout(() => {
            this.endSession();
        }, analyticsConfig.sessionTimeout);
    }

    /**
     * End the current analytics session
     */
    private endSession(): void {
        if (!this.sessionId) return;

        const sessionDuration = this.sessionStartTime
            ? Date.now() - this.sessionStartTime
            : 0;

        logger.debug('Analytics session ended', 'AnalyticsManager', {
            sessionId: this.sessionId,
            duration: sessionDuration,
        });

        this.sessionId = null;
        this.sessionStartTime = null;
    }

    /**
     * Log an analytics event
     */
    logEvent(eventName: string, properties?: Record<string, any>): void {
        if (!this.isInitialized) {
            logger.warn('Analytics not initialized. Event not logged.', 'AnalyticsManager', {
                eventName,
            });
            return;
        }

        const event: AnalyticsEvent = {
            name: eventName,
            properties: {
                ...properties,
                sessionId: this.sessionId,
            },
            timestamp: Date.now(),
        };

        logger.debug('Logging event', 'AnalyticsManager', { event });

        // Send event to all providers
        this.providers.forEach((provider) => {
            try {
                provider.logEvent(event);
            } catch (error) {
                logger.error(
                    `Failed to log event to ${provider.name}`,
                    error as Error,
                    'AnalyticsManager',
                    { eventName },
                );
            }
        });
    }

    /**
     * Set the current user ID
     */
    setUserId(userId: string): void {
        if (!this.isInitialized) {
            logger.warn('Analytics not initialized. User ID not set.', 'AnalyticsManager');
            return;
        }

        logger.debug('Setting user ID', 'AnalyticsManager', { userId });

        this.providers.forEach((provider) => {
            try {
                provider.setUserId(userId);
            } catch (error) {
                logger.error(
                    `Failed to set user ID in ${provider.name}`,
                    error as Error,
                    'AnalyticsManager',
                );
            }
        });
    }

    /**
     * Set user properties
     */
    setUserProperties(properties: Record<string, any>): void {
        if (!this.isInitialized) {
            logger.warn('Analytics not initialized. User properties not set.', 'AnalyticsManager');
            return;
        }

        logger.debug('Setting user properties', 'AnalyticsManager', { properties });

        this.providers.forEach((provider) => {
            try {
                provider.setUserProperties(properties);
            } catch (error) {
                logger.error(
                    `Failed to set user properties in ${provider.name}`,
                    error as Error,
                    'AnalyticsManager',
                );
            }
        });
    }

    /**
     * Reset user data (e.g., on logout)
     */
    resetUser(): void {
        if (!this.isInitialized) return;

        logger.debug('Resetting user', 'AnalyticsManager');

        this.providers.forEach((provider) => {
            try {
                provider.resetUser();
            } catch (error) {
                logger.error(
                    `Failed to reset user in ${provider.name}`,
                    error as Error,
                    'AnalyticsManager',
                );
            }
        });
    }

    /**
     * Flush all pending analytics events
     */
    async flush(): Promise<void> {
        if (!this.isInitialized) return;

        logger.debug('Flushing analytics', 'AnalyticsManager');

        await Promise.all(
            this.providers.map((provider) =>
                provider.flush().catch((error) => {
                    logger.error(
                        `Failed to flush ${provider.name}`,
                        error as Error,
                        'AnalyticsManager',
                    );
                }),
            ),
        );
    }

    /**
     * Track screen view
     */
    trackScreenView(screenName: string, params?: Record<string, any>): void {
        this.logEvent(AnalyticsEventName.SCREEN_VIEWED, {
            screen: screenName,
            ...params,
        });
    }

    /**
     * Track button click
     */
    trackButtonClick(buttonName: string, screenName?: string, params?: Record<string, any>): void {
        this.logEvent(AnalyticsEventName.BUTTON_CLICKED, {
            buttonName,
            screen: screenName,
            ...params,
        });
    }

    /**
     * Track feature usage
     */
    trackFeatureUsage(featureName: string, params?: Record<string, any>): void {
        this.logEvent(AnalyticsEventName.FEATURE_USED, {
            feature: featureName,
            ...params,
        });
    }

    /**
     * Track user login
     */
    trackLogin(method: string, userId: string): void {
        this.setUserId(userId);
        this.logEvent(AnalyticsEventName.USER_LOGIN, {
            method,
            userId,
        });
    }

    /**
     * Track user logout
     */
    trackLogout(): void {
        this.logEvent(AnalyticsEventName.USER_LOGOUT);
        this.resetUser();
    }

    /**
     * Track topic created
     */
    trackTopicCreated(topicId: string, category: string): void {
        this.logEvent(AnalyticsEventName.TOPIC_CREATED, {
            topicId,
            category,
        });
    }

    /**
     * Track room joined
     */
    trackRoomJoined(roomId: string, participantCount: number): void {
        this.logEvent(AnalyticsEventName.ROOM_JOINED, {
            roomId,
            participantCount,
        });
    }

    /**
     * Track room left
     */
    trackRoomLeft(roomId: string, duration: number): void {
        this.logEvent(AnalyticsEventName.ROOM_LEFT, {
            roomId,
            duration,
        });
    }

    /**
     * Track call initiated
     */
    trackCallInitiated(callId: string, calleeId: string): void {
        this.logEvent(AnalyticsEventName.CALL_INITIATED, {
            callId,
            calleeId,
        });
    }

    /**
     * Track call accepted
     */
    trackCallAccepted(callId: string): void {
        this.logEvent(AnalyticsEventName.CALL_ACCEPTED, {
            callId,
        });
    }

    /**
     * Track call rejected
     */
    trackCallRejected(callId: string): void {
        this.logEvent(AnalyticsEventName.CALL_REJECTED, {
            callId,
        });
    }

    /**
     * Track call ended
     */
    trackCallEnded(callId: string, duration: number): void {
        this.logEvent(AnalyticsEventName.CALL_ENDED, {
            callId,
            duration,
        });
    }
}

// Export singleton instance
export const analytics = AnalyticsManager.getInstance();
