import { create } from 'zustand';
import { logger } from '@logger';
import { ThemeName } from '../../src/theme/Colors';

// ============================================================================
// Types
// ============================================================================

export enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning',
}

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

export interface BottomSheet {
    id: string;
    component: React.ReactNode;
    snapPoints?: (string | number)[];
}

export interface UIState {
    // State
    isLoading: boolean;
    loadingMessage?: string;
    toast: Toast | null;
    bottomSheet: BottomSheet | null;
    isKeyboardVisible: boolean;
    activeScreen: string | null;
    themeName: ThemeName;

    // Actions
    setLoading: (isLoading: boolean, message?: string) => void;
    showToast: (type: ToastType, message: string, duration?: number) => void;
    hideToast: () => void;
    showBottomSheet: (id: string, component: React.ReactNode, snapPoints?: (string | number)[]) => void;
    hideBottomSheet: () => void;
    setKeyboardVisible: (isVisible: boolean) => void;
    setActiveScreen: (screenName: string) => void;
    setTheme: (theme: ThemeName) => void;
    reset: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useUIStore = create<UIState>((set, get) => ({
    // Initial State
    isLoading: false,
    loadingMessage: undefined,
    toast: null,
    bottomSheet: null,
    isKeyboardVisible: false,
    activeScreen: null,
    themeName: 'Dark',

    // Actions
    setLoading: (isLoading, message) => {
        logger.debug('Setting loading state', 'UIStore', { isLoading, message });
        set({ isLoading, loadingMessage: message });
    },

    showToast: (type, message, duration = 3000) => {
        const toastId = `toast_${Date.now()}`;
        logger.debug('Showing toast', 'UIStore', { type, message });

        set({ toast: { id: toastId, type, message, duration } });

        // Auto-hide toast after duration
        setTimeout(() => {
            if (get().toast?.id === toastId) {
                get().hideToast();
            }
        }, duration);
    },

    hideToast: () => {
        set({ toast: null });
    },

    showBottomSheet: (id, component, snapPoints) => {
        logger.debug('Showing bottom sheet', 'UIStore', { id });
        set({ bottomSheet: { id, component, snapPoints } });
    },

    hideBottomSheet: () => {
        logger.debug('Hiding bottom sheet', 'UIStore');
        set({ bottomSheet: null });
    },

    setKeyboardVisible: (isKeyboardVisible) => {
        set({ isKeyboardVisible });
    },

    setActiveScreen: (activeScreen) => {
        logger.debug('Setting active screen', 'UIStore', { screen: activeScreen });
        set({ activeScreen });
    },

    setTheme: (themeName) => {
        logger.info('Changing theme', 'UIStore', { themeName });
        set({ themeName });
    },

    reset: () => {
        logger.debug('Resetting UI store', 'UIStore');
        set({
            isLoading: false,
            loadingMessage: undefined,
            toast: null,
            bottomSheet: null,
            isKeyboardVisible: false,
            activeScreen: null,
            themeName: 'Dark',
        });
    },
}));

// ============================================================================
// Selectors
// ============================================================================

export const selectIsLoading = (state: UIState) => state.isLoading;
export const selectLoadingMessage = (state: UIState) => state.loadingMessage;
export const selectToast = (state: UIState) => state.toast;
export const selectBottomSheet = (state: UIState) => state.bottomSheet;
export const selectIsKeyboardVisible = (state: UIState) => state.isKeyboardVisible;
export const selectActiveScreen = (state: UIState) => state.activeScreen;
