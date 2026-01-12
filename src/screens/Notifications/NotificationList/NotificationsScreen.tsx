/**
 * Enhanced Notifications Screen
 * Shows all app notifications with filtering and actions
 * @module @screens/EnhancedNotificationsScreen
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useAuthStore } from '@stores/authStore';
import { logger } from '@logger';
import { analytics } from '@analytics/analyticsManager';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../../../theme';

enum NotificationType {
    NEW_FOLLOWER = 'new_follower',
    TOPIC_COMMENT = 'topic_comment',
    ROOM_INVITE = 'room_invite',
    CALL_MISSED = 'call_missed',
    TOPIC_POPULAR = 'topic_popular',
    SYSTEM = 'system',
}

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    data?: any;
}

const FILTER_OPTIONS = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'mentions', label: 'Mentions' },
];

export const NotificationsScreen: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [selectedFilter, setSelectedFilter] = useState('all');

    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        analytics.trackScreenView('Notifications');
        loadNotifications();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [selectedFilter, notifications]);

    const loadNotifications = () => {
        const mockNotifications = generateMockNotifications();
        setNotifications(mockNotifications);
        logger.info('Notifications loaded', 'NotificationsScreen', {
            count: mockNotifications.length
        });
    };

    const applyFilter = () => {
        switch (selectedFilter) {
            case 'unread':
                setFilteredNotifications(notifications.filter((n) => !n.isRead));
                break;
            case 'mentions':
                setFilteredNotifications(
                    notifications.filter((n) => n.message.includes('@'))
                );
                break;
            default:
                setFilteredNotifications(notifications);
        }
    };

    const handleNotificationPress = (notification: Notification) => {
        logger.debug('Notification pressed', 'NotificationsScreen', {
            id: notification.id,
            type: notification.type,
        });

        markAsRead(notification.id);

        switch (notification.type) {
            case NotificationType.ROOM_INVITE:
                break;
            case NotificationType.CALL_MISSED:
                break;
            case NotificationType.TOPIC_COMMENT:
                break;
            default:
                break;
        }

        analytics.logEvent('notification_opened', {
            notificationId: notification.id,
            type: notification.type,
        });
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        logger.info('All notifications marked as read', 'NotificationsScreen');
        analytics.logEvent('notifications_all_read');
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        logger.debug('Notification deleted', 'NotificationsScreen', { id });
    };

    const getNotificationIcon = (type: NotificationType): string => {
        switch (type) {
            case NotificationType.NEW_FOLLOWER:
                return '👤';
            case NotificationType.TOPIC_COMMENT:
                return '💬';
            case NotificationType.ROOM_INVITE:
                return '🎙️';
            case NotificationType.CALL_MISSED:
                return '📞';
            case NotificationType.TOPIC_POPULAR:
                return ' 🔥';
            case NotificationType.SYSTEM:
                return '⚙️';
            default:
                return '🔔';
        }
    };

    const renderFilterChip = ({ item }: { item: typeof FILTER_OPTIONS[0] }) => {
        const isSelected = selectedFilter === item.id;

        return (
            <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(item.id)}
            >
                <Text style={[styles.filterLabel, isSelected && styles.filterLabelActive]}>
                    {item.label}
                </Text>
                {item.id === 'unread' && notifications.filter((n) => !n.isRead).length > 0 && (
                    <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>
                            {notifications.filter((n) => !n.isRead).length}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderNotificationItem = ({ item, index }: { item: Notification; index: number }) => {
        return (
            <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
                <TouchableOpacity
                    style={[styles.notificationItem, !item.isRead && styles.notificationItemUnread]}
                    onPress={() => handleNotificationPress(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.notificationContent}>
                        <View style={[styles.iconContainer, !item.isRead && styles.iconContainerUnread]}>
                            <Text style={styles.icon}>{getNotificationIcon(item.type)}</Text>
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={[styles.title, !item.isRead && styles.titleUnread]}>
                                {item.title}
                            </Text>
                            <Text style={styles.message} numberOfLines={2}>
                                {item.message}
                            </Text>
                            <Text style={styles.timestamp}>
                                {getTimeAgo(new Date(item.timestamp))}
                            </Text>
                        </View>

                        {!item.isRead && <View style={styles.unreadDot} />}
                    </View>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteNotification(item.id)}
                    >
                        <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔔</Text>
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateText}>
                You're all caught up! Check back later for new updates.
            </Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {notifications.filter((n) => !n.isRead).length > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                    <Text style={styles.markAllButton}>Mark all read</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            <FlatList
                horizontal
                data={FILTER_OPTIONS}
                renderItem={renderFilterChip}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersList}
                style={styles.filtersContainer}
            />

            <FlatList
                data={filteredNotifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
};

const generateMockNotifications = (): Notification[] => {
    const notifications: Notification[] = [];
    const types = Object.values(NotificationType);
    for (let i = 0; i < 20; i++) {
        const type = types[i % types.length];
        notifications.push({
            id: `notif_${i}`,
            type,
            title: getNotificationTitle(type, i),
            message: getNotificationMessage(type, i),
            timestamp: new Date(Date.now() - Math.random() * 604800000).toISOString(),
            isRead: i > 5 && Math.random() > 0.3,
        });
    }
    return notifications.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
};

const getNotificationTitle = (type: NotificationType, index: number): string => {
    switch (type) {
        case NotificationType.NEW_FOLLOWER: return 'New Follower';
        case NotificationType.TOPIC_COMMENT: return 'New Comment';
        case NotificationType.ROOM_INVITE: return 'Room Invitation';
        case NotificationType.CALL_MISSED: return 'Missed Call';
        case NotificationType.TOPIC_POPULAR: return 'Trending Topic';
        case NotificationType.SYSTEM: return 'System Update';
        default: return 'Notification';
    }
};

const getNotificationMessage = (type: NotificationType, index: number): string => {
    switch (type) {
        case NotificationType.NEW_FOLLOWER: return `User${index} started following you`;
        case NotificationType.TOPIC_COMMENT: return `User${index} commented on your topic`;
        case NotificationType.ROOM_INVITE: return `User${index} invited you to join a voice room`;
        case NotificationType.CALL_MISSED: return `You missed a call from User${index}`;
        case NotificationType.TOPIC_POPULAR: return `Your topic is trending with 100+ listeners!`;
        case NotificationType.SYSTEM: return 'New features are now available. Check them out!';
        default: return 'You have a new notification';
    }
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        color: colors.text,
        fontSize: 28,
        fontWeight: '700',
    },
    markAllButton: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    filtersContainer: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filtersList: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: colors.card,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
    },
    filterLabel: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    filterLabelActive: {
        color: colors.text,
    },
    filterBadge: {
        backgroundColor: colors.error,
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    filterBadgeText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: '700',
    },
    listContainer: {
        paddingBottom: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    notificationItemUnread: {
        backgroundColor: colors.card,
    },
    notificationContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconContainerUnread: {
        backgroundColor: colors.primary,
    },
    icon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    titleUnread: {
        fontWeight: '700',
    },
    message: {
        color: colors.gray500,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 6,
    },
    timestamp: {
        color: colors.gray600,
        fontSize: 12,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginLeft: 8,
        marginTop: 6,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    deleteButtonText: {
        color: colors.gray600,
        fontSize: 18,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyStateText: {
        color: colors.gray500,
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
