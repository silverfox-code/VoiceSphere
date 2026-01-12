/**
 * Color Constants
 * UI color palette for the application
 */

export const Colors = {
    // Primary colors
    primary: '#7C3AED',
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',

    // Secondary colors
    secondary: '#3B82F6',
    secondaryLight: '#60A5FA',
    secondaryDark: '#1E40AF',

    // Accent colors
    accent: '#EC4899',
    accentLight: '#F472B6',
    accentDark: '#BE185D',

    // Background colors
    background: '#0F172A',
    backgroundLight: '#1E293B',
    backgroundDark: '#020617',

    // Surface colors
    surface: '#1E293B',
    surfaceLight: '#334155',
    surfaceDark: '#0F172A',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textDisabled: '#475569',

    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Utility colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Border colors
    border: '#334155',
    borderLight: '#475569',
} as const;

export type ColorKey = keyof typeof Colors;
