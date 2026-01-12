/**
 * Screen Interfaces
 * TypeScript interfaces for screen components
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Navigation Types
export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    Home: undefined;
    Main: undefined;
    TopicDetail: { topicId: string };
    CreateTopic: undefined;
    Profile: { userId?: string };
    Call: { topicId: string };
};

export type TabParamList = {
    Feed: undefined;
    Clubs: undefined;
    Notifications: undefined;
    Profile: undefined;
};

// Screen Props Types
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type SignupScreenProps = NativeStackScreenProps<RootStackParamList, 'Signup'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type TopicDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'TopicDetail'>;
export type CreateTopicScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateTopic'>;
export type CallScreenProps = NativeStackScreenProps<RootStackParamList, 'Call'>;

export type FeedScreenProps = BottomTabScreenProps<TabParamList, 'Feed'>;
export type ClubsScreenProps = BottomTabScreenProps<TabParamList, 'Clubs'>;
export type NotificationsScreenProps = BottomTabScreenProps<TabParamList, 'Notifications'>;
export type ProfileScreenProps = BottomTabScreenProps<TabParamList, 'Profile'>;
