/**
 * Topic Store
 * Manages topic/feed state using Zustand
 * @module @stores/topicStore
 */

import { create } from 'zustand';
import { UUID } from '@commonTypes';
import { logger } from '@logger';

// ============================================================================
// Types
// ============================================================================

export enum TopicCategory {
    WAKE_UP = 'wake-up',
    QUESTION = 'question',
    RANDOM = 'random',
    INTERESTING = 'interesting',
}

export interface Topic {
    id: UUID;
    userId: UUID;
    username: string;
    avatar?: string;
    text: string;
    category: TopicCategory;
    listenerCount: number;
    isLive: boolean;
    createdAt: string;
    roomId?: UUID;
}

export interface TopicState {
    // State
    topics: Topic[];
    selectedTopic: Topic | null;
    isLoading: boolean;
    isRefreshing: boolean;
    hasMore: boolean;
    currentPage: number;
    selectedCategory: TopicCategory | null;
    error: string | null;

    // Actions
    setTopics: (topics: Topic[]) => void;
    addTopics: (topics: Topic[]) => void;
    addTopic: (topic: Topic) => void;
    updateTopic: (topicId: UUID, updates: Partial<Topic>) => void;
    removeTopic: (topicId: UUID) => void;
    setSelectedTopic: (topic: Topic | null) => void;
    setLoading: (isLoading: boolean) => void;
    setRefreshing: (isRefreshing: boolean) => void;
    setHasMore: (hasMore: boolean) => void;
    setCurrentPage: (page: number) => void;
    setSelectedCategory: (category: TopicCategory | null) => void;
    setError: (error: string | null) => void;
    incrementListenerCount: (topicId: UUID) => void;
    decrementListenerCount: (topicId: UUID) => void;
    setTopicLiveStatus: (topicId: UUID, isLive: boolean) => void;
    clearTopics: () => void;
    reset: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useTopicStore = create<TopicState>((set, get) => ({
    // Initial State
    topics: [],
    selectedTopic: null,
    isLoading: false,
    isRefreshing: false,
    hasMore: true,
    currentPage: 1,
    selectedCategory: null,
    error: null,

    // Actions
    setTopics: (topics) => {
        logger.debug('Setting topics', 'TopicStore', { count: topics.length });
        set({ topics });
    },

    addTopics: (topics) => {
        logger.debug('Adding topics', 'TopicStore', { count: topics.length });
        set((state) => ({
            topics: [...state.topics, ...topics],
        }));
    },

    addTopic: (topic) => {
        logger.debug('Adding single topic', 'TopicStore', { topicId: topic.id });
        set((state) => ({
            topics: [topic, ...state.topics],
        }));
    },

    updateTopic: (topicId, updates) => {
        logger.debug('Updating topic', 'TopicStore', { topicId, updates });
        set((state) => ({
            topics: state.topics.map((topic) =>
                topic.id === topicId ? { ...topic, ...updates } : topic
            ),
            selectedTopic:
                state.selectedTopic?.id === topicId
                    ? { ...state.selectedTopic, ...updates }
                    : state.selectedTopic,
        }));
    },

    removeTopic: (topicId) => {
        logger.debug('Removing topic', 'TopicStore', { topicId });
        set((state) => ({
            topics: state.topics.filter((topic) => topic.id !== topicId),
            selectedTopic: state.selectedTopic?.id === topicId ? null : state.selectedTopic,
        }));
    },

    setSelectedTopic: (topic) => {
        logger.debug('Setting selected topic', 'TopicStore', { topicId: topic?.id });
        set({ selectedTopic: topic });
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },

    setRefreshing: (isRefreshing) => {
        set({ isRefreshing });
    },

    setHasMore: (hasMore) => {
        set({ hasMore });
    },

    setCurrentPage: (currentPage) => {
        set({ currentPage });
    },

    setSelectedCategory: (selectedCategory) => {
        logger.debug('Setting selected category', 'TopicStore', { category: selectedCategory });
        set({ selectedCategory });
    },

    setError: (error) => {
        if (error) {
            logger.error('Topic store error', new Error(error), 'TopicStore');
        }
        set({ error });
    },

    incrementListenerCount: (topicId) => {
        logger.debug('Incrementing listener count', 'TopicStore', { topicId });
        set((state) => ({
            topics: state.topics.map((topic) =>
                topic.id === topicId
                    ? { ...topic, listenerCount: topic.listenerCount + 1 }
                    : topic
            ),
        }));
    },

    decrementListenerCount: (topicId) => {
        logger.debug('Decrementing listener count', 'TopicStore', { topicId });
        set((state) => ({
            topics: state.topics.map((topic) =>
                topic.id === topicId
                    ? { ...topic, listenerCount: Math.max(0, topic.listenerCount - 1) }
                    : topic
            ),
        }));
    },

    setTopicLiveStatus: (topicId, isLive) => {
        logger.debug('Setting topic live status', 'TopicStore', { topicId, isLive });
        set((state) => ({
            topics: state.topics.map((topic) =>
                topic.id === topicId ? { ...topic, isLive } : topic
            ),
        }));
    },

    clearTopics: () => {
        logger.debug('Clearing topics', 'TopicStore');
        set({ topics: [], currentPage: 1, hasMore: true });
    },

    reset: () => {
        logger.debug('Resetting topic store', 'TopicStore');
        set({
            topics: [],
            selectedTopic: null,
            isLoading: false,
            isRefreshing: false,
            hasMore: true,
            currentPage: 1,
            selectedCategory: null,
            error: null,
        });
    },
}));

// ============================================================================
// Selectors
// ============================================================================

export const selectTopics = (state: TopicState) => state.topics;
export const selectLiveTopics = (state: TopicState) =>
    state.topics.filter((topic) => topic.isLive);
export const selectTopicsByCategory = (category: TopicCategory) => (state: TopicState) =>
    state.topics.filter((topic) => topic.category === category);
export const selectSelectedTopic = (state: TopicState) => state.selectedTopic;
export const selectIsLoading = (state: TopicState) => state.isLoading;
export const selectHasMore = (state: TopicState) => state.hasMore;
