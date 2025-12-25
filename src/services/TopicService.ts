import { API_URL } from '../config';

export interface Topic {
    id: string;
    title: string;
    description: string;
    author: string;
    created_at: string;
    comment_count?: number;
    reactions?: { [emoji: string]: number };
    user_reactions?: { [userId: string]: string };
}

export interface Comment {
    id: string;
    topic_id: string;
    user_id: string;
    content: string;
    created_at: string;
    reactions?: { [emoji: string]: number };
    user_reaction?: string | null;
}

export const TopicService = {
    getTopics: async (): Promise<Topic[]> => {
        try {
            const response = await fetch(`${API_URL}/topics`);
            if (!response.ok) throw new Error('Failed to fetch topics');
            return await response.json();
        } catch (error) {
            console.error('Error fetching topics:', error);
            return [];
        }
    },

    createTopic: async (title: string, description: string, author: string): Promise<Topic | null> => {
        try {
            const response = await fetch(`${API_URL}/topics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, author }),
            });
            if (!response.ok) throw new Error('Failed to create topic');
            return await response.json();
        } catch (error) {
            console.error('Error creating topic:', error);
            return null;
        }
    },

    addComment: async (topicId: string, userId: string, content: string) => {
        try {
            await fetch(`${API_URL}/topics/${topicId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, content }),
            });
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    },



    getComments: async (topicId: string, userId?: string): Promise<Comment[]> => {
        try {
            let url = `${API_URL}/topics/${topicId}/comments`;
            if (userId) {
                url += `?user_id=${encodeURIComponent(userId)}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch comments');
            return await response.json();
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    },

    deleteTopic: async (topicId: string) => {
        try {
            await fetch(`${API_URL}/topics/${topicId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Error deleting topic:', error);
        }
    },

    deleteComment: async (topicId: string, commentId: string, createdAt: string) => {
        try {
            await fetch(`${API_URL}/topics/${topicId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ created_at: createdAt }),
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    },

    updateTopic: async (topicId: string, title: string, description: string): Promise<Topic | null> => {
        try {
            const response = await fetch(`${API_URL}/topics/${topicId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            });
            if (!response.ok) throw new Error('Failed to update topic');
            return await response.json();
        } catch (error) {
            console.error('Error updating topic:', error);
            return null;
        }
    },

    addReaction: async (topicId: string, userId: string, emoji: string): Promise<void> => {
        try {
            await fetch(`${API_URL}/topics/${topicId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, emoji }),
            });
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    },

    addCommentReaction: async (topicId: string, commentId: string, userId: string, emoji: string): Promise<void> => {
        try {
            await fetch(`${API_URL}/topics/${topicId}/comments/${commentId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, emoji }),
            });
        } catch (error) {
            console.error('Error adding comment reaction:', error);
        }
    },
};
