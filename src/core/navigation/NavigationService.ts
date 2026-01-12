/**
 * Navigation Service
 * Centralized navigation methods with logging and analytics
 * @module NavigationService
 */

import * as React from 'react';
import {
    CommonActions,
    type NavigationContainerRef,
    StackActions,
} from '@react-navigation/native';
import { logger } from '@logger';
import { analytics } from '@analytics/analyticsManager';
import { NAVIGATION_ROUTES, TRACKED_ROUTES } from './NavigationConstants';

// Navigation reference
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

/**
 * Extract current route name from navigation state
 */
function extractCurrentRouteName(): string {
    const route = navigationRef?.current?.getCurrentRoute();
    return route?.name || '';
}

/**
 * Extract previous route name from navigation state
 */
function extractPrevRouteName(): string {
    const state = navigationRef?.current?.getState();
    if (!state) return '';

    const routes = state.routes;
    const currentIndex = state.index;
    const prevIndex = Math.max(currentIndex - 1, 0);

    return routes[prevIndex]?.name || '';
}

/**
 * Log navigation action
 */
function logNavigation(action: string, routeName: string, params?: any) {
    logger.debug(`Navigation: ${action} to ${routeName}`, 'NavigationService', {
        action,
        routeName,
        params,
        currentRoute: extractCurrentRouteName(),
    });

    // Track in analytics if route is tracked
    if (TRACKED_ROUTES.includes(routeName as NAVIGATION_ROUTES)) {
        analytics.trackScreenView(routeName, params);
    }
}

/**
 * Navigate to a screen
 */
export function navigate(name: NAVIGATION_ROUTES | string, params?: any) {
    if (!name) {
        logger.error(
            'Navigation: navigate called without name',
            new Error('Missing route name'),
            'NavigationService'
        );
        return;
    }

    logNavigation('navigate', name, params);
    navigationRef.current?.navigate(name as never, params);
}

/**
 * Navigate without animation
 */
export function navigateWithoutAnimation(name: NAVIGATION_ROUTES | string, params?: any) {
    if (!name) {
        logger.error(
            'Navigation: navigateWithoutAnimation called without name',
            new Error('Missing route name'),
            'NavigationService'
        );
        return;
    }

    logNavigation('navigateWithoutAnimation', name, params);
    navigationRef.current?.navigate(name as never, params);
}

/**
 * Push a screen onto the stack
 */
export function push(name: NAVIGATION_ROUTES | string, params?: any) {
    logNavigation('push', name, params);
    navigationRef.current?.dispatch(StackActions.push(name, params));
}

/**
 * Replace current screen
 */
export function replace(name: NAVIGATION_ROUTES | string, params?: any) {
    if (!name) {
        logger.error(
            'Navigation: replace called without name',
            new Error('Missing route name'),
            'NavigationService'
        );
        return;
    }

    logNavigation('replace', name, params);
    navigationRef.current?.dispatch(StackActions.replace(name, params));
}

/**
 * Go back to previous screen
 */
export function goBack() {
    const currentRoute = extractCurrentRouteName();
    const prevRoute = extractPrevRouteName();

    logger.debug(`Navigation: goBack from ${currentRoute} to ${prevRoute}`, 'NavigationService');
    navigationRef.current?.goBack();
}

/**
 * Go back with specific navigation
 */
export function goBackWithNavigation(name: NAVIGATION_ROUTES | string, params?: any) {
    logNavigation('goBackWithNavigation', name, params);
    navigationRef.current?.goBack();
}

/**
 * Get current route
 */
export function getCurrentRoute() {
    return navigationRef?.current?.getCurrentRoute();
}

/**
 * Get current route name
 */
export function getCurrentRouteName(): string {
    return extractCurrentRouteName();
}

/**
 * Navigate and reset stack
 */
export function navigateAndReset(name: NAVIGATION_ROUTES | string, params?: any) {
    logNavigation('navigateAndReset', name, params);

    navigationRef.current?.dispatch(
        CommonActions.reset({
            index: 0,
            routes: [{ name, params }],
        })
    );
}

/**
 * Navigate through multiple screens
 */
export function navigateMultipleScreens(
    path: Array<{ name: NAVIGATION_ROUTES | string; params?: any }>
) {
    logger.debug(`Navigation: navigateMultipleScreens`, 'NavigationService', {
        path: path.map((p) => p.name),
    });

    if (path.length === 0) {
        return;
    }

    if (path.length === 1) {
        navigate(path[0].name, path[0].params);
        return;
    }

    path.forEach((node) => {
        navigateWithoutAnimation(node.name, node.params);
    });
}

/**
 * Navigate and reset with multiple screens
 */
export function navigateAndResetMultipleScreens(
    path: Array<{ name: NAVIGATION_ROUTES | string; params?: any }>
) {
    logger.debug(`Navigation: navigateAndResetMultipleScreens`, 'NavigationService', {
        path: path.map((p) => p.name),
    });

    if (path.length === 0) {
        return;
    }

    navigationRef.current?.dispatch(
        CommonActions.reset({
            index: path.length - 1,
            routes: path.map(({ name, params }) => ({ name, params })),
        })
    );
}

/**
 * Check if can go back
 */
export function canGoBack(): boolean {
    return navigationRef.current?.canGoBack() || false;
}

/**
 * Pop to top of stack
 */
export function popToTop() {
    logger.debug('Navigation: popToTop', 'NavigationService');
    navigationRef.current?.dispatch(StackActions.popToTop());
}

/**
 * Pop N screens
 */
export function pop(count: number = 1) {
    logger.debug(`Navigation: pop ${count} screens`, 'NavigationService');
    navigationRef.current?.dispatch(StackActions.pop(count));
}

/**
 * Deep link navigation helper
 */
export function navigateFromDeepLink(url: string, params?: any) {
    logger.info('Navigation: Deep link', 'NavigationService', { url, params });
    analytics.logEvent('deep_link_opened', { url, params });

    // TODO: Parse URL and navigate to appropriate screen
    // This would use CTA_ROUTE_MAP to map external URLs to internal routes
}

/**
 * Get navigation state
 */
export function getNavigationState() {
    return navigationRef.current?.getState();
}

/**
 * Check if route is in stack
 */
export function isRouteInStack(routeName: NAVIGATION_ROUTES | string): boolean {
    const state = getNavigationState();
    if (!state) return false;

    return state.routes.some((route) => route.name === routeName);
}

// Export navigation reference for use in NavigationContainer
export default {
    navigationRef,
    navigate,
    navigateWithoutAnimation,
    push,
    replace,
    goBack,
    goBackWithNavigation,
    getCurrentRoute,
    getCurrentRouteName,
    navigateAndReset,
    navigateMultipleScreens,
    navigateAndResetMultipleScreens,
    canGoBack,
    popToTop,
    pop,
    navigateFromDeepLink,
    getNavigationState,
    isRouteInStack,
};
