/**
 * Analytics Configuration
 * @module @analytics/analyticsConfig
 */

import { Environment } from '@commonTypes';

export interface AnalyticsProviderConfig {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
    debugMode?: boolean;
}

export interface AnalyticsConfig {
    environment: Environment;
    providers: {
        firebase?: AnalyticsProviderConfig;
        mixpanel?: AnalyticsProviderConfig;
        amplitude?: AnalyticsProviderConfig;
        customBackend?: AnalyticsProviderConfig;
    };
    enableAutoTracking: boolean;
    enableCrashReporting: boolean;
    sessionTimeout: number; // milliseconds
    batchSize: number;
    flushInterval: number; // milliseconds
}

const developmentConfig: AnalyticsConfig = {
    environment: Environment.DEVELOPMENT,
    providers: {
        firebase: {
            enabled: false,
            debugMode: true,
        },
        customBackend: {
            enabled: true,
            endpoint: 'http://localhost:3000/analytics',
            debugMode: true,
        },
    },
    enableAutoTracking: true,
    enableCrashReporting: false,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    batchSize: 20,
    flushInterval: 10000, // 10 seconds
};

const productionConfig: AnalyticsConfig = {
    environment: Environment.PRODUCTION,
    providers: {
        firebase: {
            enabled: true,
            apiKey: process.env.FIREBASE_API_KEY,
            debugMode: false,
        },
        mixpanel: {
            enabled: true,
            apiKey: process.env.MIXPANEL_API_KEY,
            debugMode: false,
        },
        customBackend: {
            enabled: true,
            endpoint: process.env.ANALYTICS_ENDPOINT || 'https://api.voicesphere.app/analytics',
            debugMode: false,
        },
    },
    enableAutoTracking: true,
    enableCrashReporting: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    batchSize: 50,
    flushInterval: 30000, // 30 seconds
};

export const getAnalyticsConfig = (): AnalyticsConfig => {
    const env = process.env.NODE_ENV || 'development';

    switch (env) {
        case 'production':
            return productionConfig;
        case 'development':
        default:
            return developmentConfig;
    }
};

export const analyticsConfig = getAnalyticsConfig();
