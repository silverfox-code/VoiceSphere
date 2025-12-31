import React, { createContext, useContext, useState, useEffect } from 'react';
import { webSocketService } from '../services/WebSocketService';

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
        const unsubscribe = webSocketService.addListener((msg) => {
            if (msg.event_type === 'NEW_COMMENT') {
                const comment = msg.data;
                const newNotification: Notification = {
                    id: Date.now().toString(), // Simple ID generation
                    type: 'NEW_COMMENT',
                    title: 'New Comment',
                    message: `Someone commented: ${comment.content}`,
                    data: comment,
                    read: false,
                    timestamp: new Date(),
                };
                setNotifications(prev => [newNotification, ...prev]);
            } else if (msg.event_type === 'REACTION_UPDATE') {
                // Handle reaction notifications if needed
            }
        });

        return () => {
            unsubscribe();
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
