/**
 * Authentication Store
 * Manages authentication state using Zustand
 * @module @stores/authStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UUID, UserPresenceStatus } from '@commonTypes';
import { STORAGE_KEYS } from '@constants';
import { logger } from '@logger';

// ============================================================================
// Types
// ============================================================================

export interface User {
    id: UUID;
    email: string;
    name: string;
    username: string;
    avatar?: string;
    phoneNumber?: string;
    bio?: string;
    createdAt: string;
    stats: UserStats;
}

export interface UserStats {
    topicsPosted: number;
    roomsJoined: number;
    totalTalkTime: number; // in seconds
    followersCount: number;
    followingCount: number;
}

export interface AuthState {
    // State
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    presenceStatus: UserPresenceStatus;

    // Actions
    setUser: (user: User | null) => void;
    setTokens: (token: string, refreshToken: string) => void;
    clearTokens: () => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setPresenceStatus: (status: UserPresenceStatus) => void;
    login: (user: User, token: string, refreshToken: string) => void;
    logout: () => void;
    updateUserStats: (stats: Partial<UserStats>) => void;
    updateProfile: (updates: Partial<User>) => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial State
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            presenceStatus: UserPresenceStatus.OFFLINE,

            // Actions
            setUser: (user) => {
                logger.debug('Setting user', 'AuthStore', { userId: user?.id });
                set({ user, isAuthenticated: !!user });
            },

            setTokens: (token, refreshToken) => {
                logger.debug('Setting tokens', 'AuthStore');
                set({ token, refreshToken, isAuthenticated: true });
            },

            clearTokens: () => {
                logger.debug('Clearing tokens', 'AuthStore');
                set({ token: null, refreshToken: null, isAuthenticated: false });
            },

            setLoading: (isLoading) => {
                set({ isLoading });
            },

            setError: (error) => {
                logger.error('Auth error', new Error(error || 'Unknown auth error'), 'AuthStore');
                set({ error });
            },

            setPresenceStatus: (presenceStatus) => {
                logger.debug('Setting presence status', 'AuthStore', { presenceStatus });
                set({ presenceStatus });
            },

            login: (user, token, refreshToken) => {
                logger.info('User logged in', 'AuthStore', { userId: user.id, username: user.username });
                set({
                    user,
                    token,
                    refreshToken,
                    isAuthenticated: true,
                    error: null,
                    presenceStatus: UserPresenceStatus.ONLINE,
                });
            },

            logout: () => {
                logger.info('User logged out', 'AuthStore', { userId: get().user?.id });
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    error: null,
                    presenceStatus: UserPresenceStatus.OFFLINE,
                });
            },

            updateUserStats: (stats) => {
                const currentUser = get().user;
                if (currentUser) {
                    logger.debug('Updating user stats', 'AuthStore', stats);
                    set({
                        user: {
                            ...currentUser,
                            stats: {
                                ...currentUser.stats,
                                ...stats,
                            },
                        },
                    });
                }
            },

            updateProfile: (updates) => {
                const currentUser = get().user;
                if (currentUser) {
                    logger.debug('Updating user profile', 'AuthStore', updates);
                    set({
                        user: {
                            ...currentUser,
                            ...updates,
                        },
                    });
                }
            },
        }),
        {
            name: STORAGE_KEYS.USER_DATA,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);

// ============================================================================
// Selectors (for better performance)
// ============================================================================

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectToken = (state: AuthState) => state.token;
export const selectUserStats = (state: AuthState) => state.user?.stats;
export const selectPresenceStatus = (state: AuthState) => state.presenceStatus;
