/**
 * VoiceSphere - Main Application Entry Point
 * Production-ready app with proper initialization and centralized navigation
 * @module App
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from '@core/navigation/RootNavigator';
import { navigationRef } from '@core/navigation/NavigationService';
import { analytics } from '@analytics/analyticsManager';
import { webSocketService } from '@socket/WebSocketService';
import { logger, LogLevel } from '@logger';
import { Environment } from '@commonTypes';
import { Colors, useTheme } from './src/theme';

const App = () => {
  const { colors, themeName } = useTheme();

  useEffect(() => {
    // Initialize app on mount
    initializeApp();

    return () => {
      // Cleanup on unmount
      cleanupApp();
    };
  }, []);

  const initializeApp = async () => {
    try {
      logger.info('🚀 VoiceSphere app starting...', 'App');

      // Configure logger for current environment
      logger.configure({
        logLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
        environment: __DEV__ ? Environment.DEVELOPMENT : Environment.PRODUCTION,
        enableConsoleOutput: __DEV__,
        maxBufferSize: 100,
      });

      // Initialize analytics (production only)
      if (!__DEV__) {
        await analytics.initialize();
        logger.info('✅ Analytics initialized', 'App');
      } else {
        logger.info('⏭️  Analytics skipped (dev mode)', 'App');
      }

      logger.info('✅ VoiceSphere app started successfully', 'App');
    } catch (error) {
      logger.error('❌ Failed to initialize app', error as Error, 'App');
    }
  };

  const cleanupApp = async () => {
    try {
      logger.info('🧹 Cleaning up app resources...', 'App');

      if (!__DEV__) {
        await analytics.flush();
      }

      webSocketService.disconnect();

      logger.info('✅ App cleanup complete', 'App');
    } catch (error) {
      logger.error('❌ Error during cleanup', error as Error, 'App');
    }
  };

  const handleNavigationReady = () => {
    logger.debug('Navigation ready', 'App');
  };

  const handleNavigationStateChange = () => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (currentRoute) {
      logger.debug('Navigation state changed', 'App', {
        routeName: currentRoute.name,
        params: currentRoute.params,
      });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={themeName === 'Midnight' || themeName === 'Dark' ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent
      />
      <NavigationContainer
        ref={navigationRef}
        onReady={handleNavigationReady}
        onStateChange={handleNavigationStateChange}
      >
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
