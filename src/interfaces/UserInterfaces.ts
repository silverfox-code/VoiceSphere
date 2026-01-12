/**
 * User Interfaces
 * TypeScript interfaces for user-related data structures
 */

export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatar?: string;
    bio?: string;
    role: 'user' | 'moderator' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile extends User {
    followers: number;
    following: number;
    totalTopics: number;
    totalClubs: number;
}

export interface AuthUser {
    user: User;
    token: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    email: string;
    username: string;
    displayName: string;
    password: string;
    confirmPassword: string;
}
