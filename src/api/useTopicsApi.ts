/**
 * Topics API Hook
 * Custom hook for interacting with topics API endpoints
 */

import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '@appConstants/ApiEndpoints';
import { logger } from '@logger';
import { ApiResponse, PaginatedResponse } from '@commonTypes/index';

export interface Topic {
    id: string;
    title: string;
    description: string;
    createdBy: string;
    createdAt: Date;
    participants: string[];
    maxParticipants: number;
    tags: string[];
    status: 'draft' | 'active' | 'ended';
}

export interface CreateTopicDto {
    title: string;
    description: string;
    tags: string[];
    maxParticipants?: number;
}

export const useTopicsApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTopics = useCallback(async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Topic> | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_ENDPOINTS.TOPICS.LIST}?page=${page}&limit=${limit}`);
            const data: ApiResponse<PaginatedResponse<Topic>> = await response.json();

            if (data.success && data.data) {
                logger.info('Topics fetched successfully', data.data);
                return data.data;
            } else {
                setError(data.error || 'Failed to fetch topics');
                return null;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            logger.error('Error fetching topics', err as Error);
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTopicById = useCallback(async (id: string): Promise<Topic | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_ENDPOINTS.TOPICS.DETAIL(id));
            const data: ApiResponse<Topic> = await response.json();

            if (data.success && data.data) {
                logger.info('Topic fetched successfully', data.data);
                return data.data;
            } else {
                setError(data.error || 'Failed to fetch topic');
                return null;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            logger.error('Error fetching topic', err as Error);
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createTopic = useCallback(async (topicData: CreateTopicDto): Promise<Topic | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_ENDPOINTS.TOPICS.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(topicData),
            });

            const data: ApiResponse<Topic> = await response.json();

            if (data.success && data.data) {
                logger.info('Topic created successfully', data.data);
                return data.data;
            } else {
                setError(data.error || 'Failed to create topic');
                return null;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            logger.error('Error creating topic', err as Error);
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        fetchTopics,
        fetchTopicById,
        createTopic,
    };
};
