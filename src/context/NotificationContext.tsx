import { webSocketService } from '@socket/WebSocketService';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
    id: string;
    type: 'NEW_COMMENT' | 'REACTION_UPDATE';
    title: string;
    message: string;
    data: any; // topic_id, comment_id, etc.
    read: boolean;
    timestamp: Date;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Subscribe to new comment events
        const unsubscribeComment = webSocketService.on('NEW_COMMENT', (msg: any) => {
            const comment = msg.data || msg;
            const newNotification: Notification = {
                id: Date.now().toString(),
                type: 'NEW_COMMENT',
                title: 'New Comment',
                message: `Someone commented: ${comment.content || comment.message || 'New comment'}`,
                data: comment,
                read: false,
                timestamp: new Date(),
            };
            setNotifications(prev => [newNotification, ...prev]);
        });

        // Subscribe to reaction update events  
        const unsubscribeReaction = webSocketService.on('REACTION_UPDATE', (msg: any) => {
            // Handle reaction notifications if needed
            console.log('Reaction update:', msg);
        });

        return () => {
            unsubscribeComment();
            unsubscribeReaction();
        };
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
