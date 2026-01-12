/**
 * VoiceSphere Color Palettes
 * Defines multiple theme variants for the application
 */

export type ThemeName = 'Dark' | 'Ocean' | 'Midnight' | 'Forest' | 'Aura';

export interface ColorPalette {
    background: string;
    text: string;
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    accentDark: string;
    accentLight: string;
    speaking: string;
    muted: string;
    error: string;
    success: string;
    warning: string;
    gray50: string;
    gray100: string;
    gray200: string;
    gray300: string;
    gray400: string;
    gray500: string;
    gray600: string;
    gray700: string;
    gray800: string;
    gray900: string;
    card: string;
    border: string;
    disabled: string;
    overlay: string;
    primaryTransparent: string;
    accentTransparent: string;
}

const BaseGrays = {
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
};

export const Palettes: Record<ThemeName, ColorPalette> = {
    Dark: {
        background: '#0A0E17',
        text: '#FFFFFF',
        primary: '#6366F1',
        primaryDark: '#4F46E5',
        primaryLight: '#818CF8',
        accent: '#EC4899',
        accentDark: '#DB2777',
        accentLight: '#F472B6',
        speaking: '#10B981',
        muted: '#6B7280',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        ...BaseGrays,
        card: '#161B2C',
        border: '#1E293B',
        disabled: '#4B5563',
        overlay: 'rgba(0, 0, 0, 0.7)',
        primaryTransparent: 'rgba(99, 102, 241, 0.15)',
        accentTransparent: 'rgba(236, 72, 153, 0.15)',
    },
    Ocean: {
        background: '#051923',
        text: '#E0FBFC',
        primary: '#00A6FB',
        primaryDark: '#006494',
        primaryLight: '#0582CA',
        accent: '#98C1D9',
        accentDark: '#3D5A80',
        accentLight: '#E0FBFC',
        speaking: '#4CC9F0',
        muted: '#52796F',
        error: '#FF4D6D',
        success: '#2D6A4F',
        warning: '#EE9B00',
        ...BaseGrays,
        card: '#003554',
        border: '#006494',
        disabled: '#52796F',
        overlay: 'rgba(5, 25, 35, 0.8)',
        primaryTransparent: 'rgba(0, 166, 251, 0.15)',
        accentTransparent: 'rgba(152, 193, 217, 0.15)',
    },
    Midnight: {
        background: '#000000',
        text: '#FFFFFF',
        primary: '#FFFFFF',
        primaryDark: '#CCCCCC',
        primaryLight: '#FFFFFF',
        accent: '#333333',
        accentDark: '#111111',
        accentLight: '#555555',
        speaking: '#FFFFFF',
        muted: '#666666',
        error: '#FF0000',
        success: '#FFFFFF',
        warning: '#AAAAAA',
        ...BaseGrays,
        card: '#111111',
        border: '#333333',
        disabled: '#222222',
        overlay: 'rgba(0, 0, 0, 0.9)',
        primaryTransparent: 'rgba(255, 255, 255, 0.1)',
        accentTransparent: 'rgba(51, 51, 51, 0.15)',
    },
    Forest: {
        background: '#0B120B',
        text: '#ECF3EC',
        primary: '#2D6A4F',
        primaryDark: '#1B4332',
        primaryLight: '#40916C',
        accent: '#D8E2DC',
        accentDark: '#9DB4C0',
        accentLight: '#FFE5D9',
        speaking: '#74C69D',
        muted: '#52796F',
        error: '#BC4749',
        success: '#52B788',
        warning: '#FCCA46',
        ...BaseGrays,
        card: '#1B241B',
        border: '#2D3A2D',
        disabled: '#3A4D3A',
        overlay: 'rgba(11, 18, 11, 0.8)',
        primaryTransparent: 'rgba(45, 106, 79, 0.15)',
        accentTransparent: 'rgba(216, 226, 220, 0.15)',
    },
    Aura: {
        background: '#0F172A',
        text: '#F8FAFC',
        primary: '#8B5CF6',
        primaryDark: '#7C3AED',
        primaryLight: '#A78BFA',
        accent: '#F472B6',
        accentDark: '#DB2777',
        accentLight: '#FB923C',
        speaking: '#10B981',
        muted: '#64748B',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        ...BaseGrays,
        card: '#1E293B',
        border: '#334155',
        disabled: '#475569',
        overlay: 'rgba(15, 23, 42, 0.8)',
        primaryTransparent: 'rgba(139, 92, 246, 0.15)',
        accentTransparent: 'rgba(244, 114, 182, 0.15)',
    },
};
