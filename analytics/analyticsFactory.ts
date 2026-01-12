/**
 * Analytics Factory
 * Creates analytics provider instances based on configuration
 * @module @analytics/analyticsFactory
 */

import { AnalyticsEvent } from '@commonTypes';
import { logger } from '@logger';
import { analyticsConfig, AnalyticsProviderConfig } from './analyticsConfig';

/**
 * Base Analytics Provider Interface
 * All analytics providers must implement this interface
 */
export interface IAnalyticsProvider {
    readonly name: string;
    initialize(): Promise<void>;
    logEvent(event: AnalyticsEvent): void;
    setUserId(userId: string): void;
    setUserProperties(properties: Record<string, any>): void;
    resetUser(): void;
    flush(): Promise<void>;
}

/**
 * Firebase Analytics Provider
 */
class FirebaseAnalyticsProvider implements IAnalyticsProvider {
    readonly name = 'Firebase';
    private isInitialized = false;
    private config: AnalyticsProviderConfig;

    constructor(config: AnalyticsProviderConfig) {
        this.config = config;
    }

    async initialize(): Promise<void> {
        if (!this.config.enabled) {
            logger.debug('Firebase Analytics is disabled', 'AnalyticsFactory');
            return;
        }

        try {
            // TODO: Initialize Firebase Analytics SDK
            // import analytics from '@react-native-firebase/analytics';
            // await analytics().setAnalyticsCollectionEnabled(true);

            this.isInitialized = true;
            logger.info('Firebase Analytics initialized', 'AnalyticsFactory');
        } catch (error) {
            logger.error('Failed to initialize Firebase Analytics', error as Error, 'AnalyticsFactory');
        }
    }

    logEvent(event: AnalyticsEvent): void {
        if (!this.isInitialized) return;

        if (this.config.debugMode) {
            logger.debug('Firebase Event', 'AnalyticsFactory', { event });
        }

        // TODO: Implement Firebase event logging
        // analytics().logEvent(event.name, event.properties);
    }

    setUserId(userId: string): void {
        if (!this.isInitialized) return;

        // TODO: Set user ID in Firebase
        // analytics().setUserId(userId);
        logger.debug('Firebase user ID set', 'AnalyticsFactory', { userId });
    }

    setUserProperties(properties: Record<string, any>): void {
        if (!this.isInitialized) return;

        // TODO: Set user properties in Firebase
        // analytics().setUserProperties(properties);
        logger.debug('Firebase user properties set', 'AnalyticsFactory', { properties });
    }

    resetUser(): void {
        if (!this.isInitialized) return;

        // TODO: Reset user in Firebase
        // analytics().resetAnalyticsData();
        logger.debug('Firebase user reset', 'AnalyticsFactory');
    }

    async flush(): Promise<void> {
        // Firebase handles flushing automatically
    }
}

/**
 * Mixpanel Analytics Provider
 */
class MixpanelAnalyticsProvider implements IAnalyticsProvider {
    readonly name = 'Mixpanel';
    private isInitialized = false;
    private config: AnalyticsProviderConfig;

    constructor(config: AnalyticsProviderConfig) {
        this.config = config;
    }

    async initialize(): Promise<void> {
        if (!this.config.enabled) {
            logger.debug('Mixpanel Analytics is disabled', 'AnalyticsFactory');
            return;
        }

        try {
            // TODO: Initialize Mixpanel SDK
            // import { Mixpanel } from 'mixpanel-react-native';
            // await Mixpanel.init(this.config.apiKey!);

            this.isInitialized = true;
            logger.info('Mixpanel Analytics initialized', 'AnalyticsFactory');
        } catch (error) {
            logger.error('Failed to initialize Mixpanel Analytics', error as Error, 'AnalyticsFactory');
        }
    }

    logEvent(event: AnalyticsEvent): void {
        if (!this.isInitialized) return;

        if (this.config.debugMode) {
            logger.debug('Mixpanel Event', 'AnalyticsFactory', { event });
        }

        // TODO: Implement Mixpanel event tracking
        // Mixpanel.track(event.name, event.properties);
    }

    setUserId(userId: string): void {
        if (!this.isInitialized) return;

        // TODO: Identify user in Mixpanel
        // Mixpanel.identify(userId);
        logger.debug('Mixpanel user ID set', 'AnalyticsFactory', { userId });
    }

    setUserProperties(properties: Record<string, any>): void {
        if (!this.isInitialized) return;

        // TODO: Set user properties in Mixpanel
        // Mixpanel.getPeople().set(properties);
        logger.debug('Mixpanel user properties set', 'AnalyticsFactory', { properties });
    }

    resetUser(): void {
        if (!this.isInitialized) return;

        // TODO: Reset user in Mixpanel
        // Mixpanel.reset();
        logger.debug('Mixpanel user reset', 'AnalyticsFactory');
    }

    async flush(): Promise<void> {
        if (!this.isInitialized) return;

        // TODO: Flush Mixpanel events
        // await Mixpanel.flush();
    }
}

/**
 * Custom Backend Analytics Provider
 */
class CustomBackendAnalyticsProvider implements IAnalyticsProvider {
    readonly name = 'CustomBackend';
    private isInitialized = false;
    private config: AnalyticsProviderConfig;
    private eventQueue: AnalyticsEvent[] = [];
    private userId: string | null = null;

    constructor(config: AnalyticsProviderConfig) {
        this.config = config;
    }

    async initialize(): Promise<void> {
        if (!this.config.enabled) {
            logger.debug('Custom Backend Analytics is disabled', 'AnalyticsFactory');
            return;
        }

        this.isInitialized = true;
        logger.info('Custom Backend Analytics initialized', 'AnalyticsFactory', {
            endpoint: this.config.endpoint,
        });

        // Start periodic flush
        this.startPeriodicFlush();
    }

    logEvent(event: AnalyticsEvent): void {
        if (!this.isInitialized) return;

        const enrichedEvent = {
            ...event,
            userId: this.userId,
            timestamp: Date.now(),
        };

        if (this.config.debugMode) {
            logger.debug('Custom Backend Event', 'AnalyticsFactory', { event: enrichedEvent });
        }

        this.eventQueue.push(enrichedEvent);

        // Flush if queue is full
        if (this.eventQueue.length >= analyticsConfig.batchSize) {
            this.flush().catch((error) => {
                logger.error('Failed to flush analytics', error as Error, 'AnalyticsFactory');
            });
        }
    }

    setUserId(userId: string): void {
        this.userId = userId;
        logger.debug('Custom Backend user ID set', 'AnalyticsFactory', { userId });
    }

    setUserProperties(properties: Record<string, any>): void {
        // Send user properties as a special event
        this.logEvent({
            name: 'user_properties_updated',
            properties,
            timestamp: Date.now(),
            userId: this.userId || undefined,
        });
    }

    resetUser(): void {
        this.userId = null;
        logger.debug('Custom Backend user reset', 'AnalyticsFactory');
    }

    async flush(): Promise<void> {
        if (!this.isInitialized || this.eventQueue.length === 0) return;

        const eventsToSend = [...this.eventQueue];
        this.eventQueue = [];

        try {
            const response = await fetch(this.config.endpoint!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events: eventsToSend }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            logger.debug('Analytics events flushed', 'AnalyticsFactory', {
                count: eventsToSend.length,
            });
        } catch (error) {
            // Re-queue failed events
            this.eventQueue.unshift(...eventsToSend);
            logger.error('Failed to send analytics events', error as Error, 'AnalyticsFactory');
        }
    }

    private startPeriodicFlush(): void {
        setInterval(() => {
            this.flush().catch((error) => {
                logger.error('Periodic flush failed', error as Error, 'AnalyticsFactory');
            });
        }, analyticsConfig.flushInterval);
    }
}

/**
 * Analytics Factory
 * Creates and manages analytics provider instances
 */
class AnalyticsFactory {
    private providers: IAnalyticsProvider[] = [];

    /**
     * Create all enabled analytics providers
     */
    createProviders(): IAnalyticsProvider[] {
        const { providers: providerConfigs } = analyticsConfig;
        const createdProviders: IAnalyticsProvider[] = [];

        if (providerConfigs.firebase?.enabled) {
            createdProviders.push(new FirebaseAnalyticsProvider(providerConfigs.firebase));
        }

        if (providerConfigs.mixpanel?.enabled) {
            createdProviders.push(new MixpanelAnalyticsProvider(providerConfigs.mixpanel));
        }

        if (providerConfigs.customBackend?.enabled) {
            createdProviders.push(new CustomBackendAnalyticsProvider(providerConfigs.customBackend));
        }

        this.providers = createdProviders;
        logger.info('Analytics providers created', 'AnalyticsFactory', {
            count: createdProviders.length,
            providers: createdProviders.map((p) => p.name),
        });

        return createdProviders;
    }

    /**
     * Get all created providers
     */
    getProviders(): IAnalyticsProvider[] {
        return this.providers;
    }
}

export const analyticsFactory = new AnalyticsFactory();
