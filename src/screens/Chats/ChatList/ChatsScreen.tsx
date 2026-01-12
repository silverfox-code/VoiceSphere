import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useAuthStore } from '@stores/authStore';
import { logger } from '@logger';
import { analytics } from '@analytics/analyticsManager';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../../../theme';

interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    avatar?: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isOnline: boolean;
}

export const ChatsScreen: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [chats, setChats] = useState<ChatMessage[]>([]);
    const [filteredChats, setFilteredChats] = useState<ChatMessage[]>([]);

    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        analytics.trackScreenView('Chats');
        loadChats();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = chats.filter((chat) =>
                chat.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredChats(filtered);
        } else {
            setFilteredChats(chats);
        }
    }, [searchQuery, chats]);

    const loadChats = () => {
        const mockChats: ChatMessage[] = generateMockChats();
        setChats(mockChats);
        setFilteredChats(mockChats);
        logger.info('Chats loaded', 'ChatsScreen', { count: mockChats.length });
    };

    const handleChatPress = (chat: ChatMessage) => {
        logger.debug('Chat pressed', 'ChatsScreen', { userId: chat.userId });
        analytics.logEvent('chat_opened', { userId: chat.userId });
    };

    const renderChatItem = ({ item, index }: { item: ChatMessage; index: number }) => {
        const hasUnread = item.unreadCount > 0;

        return (
            <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
                <TouchableOpacity
                    style={[styles.chatItem, hasUnread && styles.chatItemUnread]}
                    onPress={() => handleChatPress(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.username.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        {item.isOnline && <View style={styles.onlineDot} />}
                    </View>

                    <View style={styles.messageInfo}>
                        <View style={styles.messageHeader}>
                            <Text style={[styles.username, hasUnread && styles.usernameUnread]}>
                                {item.username}
                            </Text>
                            <Text style={styles.timestamp}>
                                {getTimeAgo(new Date(item.timestamp))}
                            </Text>
                        </View>

                        <View style={styles.messageFooter}>
                            <Text
                                style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
                                numberOfLines={1}
                            >
                                {item.lastMessage}
                            </Text>

                            {hasUnread && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>
                                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💬</Text>
            <Text style={styles.emptyStateTitle}>No messages yet</Text>
            <Text style={styles.emptyStateText}>
                Start a conversation by joining a voice room
            </Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
            <TouchableOpacity style={styles.newChatButton}>
                <Text style={styles.newChatButtonText}>+ New</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search messages..."
                    placeholderTextColor={colors.gray500}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={styles.clearButton}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredChats}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(date).toLocaleDateString();
};

const generateMockChats = (): ChatMessage[] => {
    const chats: ChatMessage[] = [];
    const messages = [
        "Hey! That was a great voice chat earlier 🎉",
        "Thanks for sharing your thoughts on that topic!",
        "Would love to discuss this more sometime",
        "Great conversation! Let's connect again",
        "Interesting perspective, let's talk more",
        "That was really insightful, thank you!",
        "Looking forward to more discussions",
        "Your input was really valuable",
    ];
    for (let i = 0; i < 15; i++) {
        chats.push({
            id: `chat_${i}`,
            userId: `user_${i}`,
            username: `User ${i}`,
            lastMessage: messages[i % messages.length],
            timestamp: new Date(Date.now() - Math.random() * 604800000).toISOString(),
            unreadCount: i < 3 ? Math.floor(Math.random() * 5) + 1 : 0,
            isOnline: Math.random() > 0.5,
        });
    }
    return chats.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 48,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        color: colors.text,
        fontSize: 28,
        fontWeight: '700',
    },
    newChatButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    newChatButtonText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        fontSize: 16,
    },
    clearButton: {
        color: colors.gray500,
        fontSize: 18,
        paddingHorizontal: 8,
    },
    listContainer: {
        paddingBottom: 20,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    chatItemUnread: {
        backgroundColor: colors.card,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: colors.text,
        fontSize: 24,
        fontWeight: '700',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.speaking,
        borderWidth: 2,
        borderColor: colors.background,
    },
    messageInfo: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    username: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    usernameUnread: {
        fontWeight: '700',
    },
    timestamp: {
        color: colors.gray500,
        fontSize: 12,
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        flex: 1,
        color: colors.gray500,
        fontSize: 14,
        marginRight: 8,
    },
    lastMessageUnread: {
        color: colors.text,
        fontWeight: '500',
    },
    unreadBadge: {
        backgroundColor: colors.primary,
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    unreadText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: '700',
    },
    emptyState: {
        flex: 1,
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
