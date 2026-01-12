import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTopicStore, Topic, TopicCategory } from '@stores/topicStore';
import { useAuthStore } from '@stores/authStore';
import { webSocketService } from '@socket/WebSocketService';
import { WS_EVENTS } from '@constants';
import { logger } from '@logger';
import { analytics } from '@analytics/analyticsManager';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../../theme';

const { width } = Dimensions.get('window');

type RootStackParamList = {
    VoiceRoom: {
        roomId: string;
        topicId?: string;
        topic: string;
    };
    CreateTopic: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
    { id: null, label: 'All', icon: '🌐' },
    { id: TopicCategory.WAKE_UP, label: 'Wake-up', icon: '☀️' },
    { id: TopicCategory.QUESTION, label: 'Question', icon: '❓' },
    { id: TopicCategory.RANDOM, label: 'Random', icon: '🎲' },
    { id: TopicCategory.INTERESTING, label: 'Interesting', icon: '✨' },
];

export const LiveFeedScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const user = useAuthStore((state) => state.user);
    const { colors, themeName } = useTheme();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const {
        topics,
        isLoading,
        isRefreshing,
        hasMore,
        currentPage,
        selectedCategory,
        setTopics,
        addTopics,
        setSelectedCategory,
        setRefreshing,
        setCurrentPage,
        updateTopic,
    } = useTopicStore();

    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        analytics.trackScreenView('LiveFeed');
    }, []);

    useEffect(() => {
        loadTopics(true);
    }, [selectedCategory]);

    useEffect(() => {
        const unsubTopicCreated = webSocketService.on(WS_EVENTS.TOPIC_CREATED, (data: Topic) => {
            logger.debug('New topic created', 'LiveFeedScreen', { topicId: data.id });
            if (!selectedCategory || data.category === selectedCategory) {
                useTopicStore.getState().addTopic(data);
            }
        });

        const unsubTopicUpdated = webSocketService.on(WS_EVENTS.TOPIC_UPDATED, (data: any) => {
            logger.debug('Topic updated', 'LiveFeedScreen', { topicId: data.id });
            updateTopic(data.id, data);
        });

        return () => {
            unsubTopicCreated();
            unsubTopicUpdated();
        };
    }, [selectedCategory, updateTopic]);

    const loadTopics = async (refresh: boolean = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
                setCurrentPage(1);
            } else {
                setLoadingMore(true);
            }

            await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
            const mockTopics: Topic[] = generateMockTopics(refresh ? 1 : currentPage);

            if (refresh) {
                setTopics(mockTopics);
            } else {
                addTopics(mockTopics);
            }

            if (!refresh) {
                setCurrentPage(currentPage + 1);
            }
        } catch (error) {
            logger.error('Failed to load topics', error as Error, 'LiveFeedScreen');
        } finally {
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleRefresh = useCallback(() => {
        loadTopics(true);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMore && !isRefreshing) {
            loadTopics(false);
        }
    }, [loadingMore, hasMore, isRefreshing]);

    const handleCategoryPress = useCallback((category: TopicCategory | null) => {
        setSelectedCategory(category);
        analytics.logEvent('category_selected', { category: category || 'all' });
    }, [setSelectedCategory]);

    const handleTopicPress = useCallback((topic: Topic) => {
        navigation.navigate('VoiceRoom', {
            roomId: topic.roomId || topic.id,
            topicId: topic.id,
            topic: topic.text,
        });
    }, [navigation]);

    const handleCreateTopic = useCallback(() => {
        navigation.navigate('CreateTopic');
    }, [navigation]);

    const renderCategoryChip = ({ item }: { item: typeof CATEGORIES[0] }) => {
        const isSelected = selectedCategory === item.id;

        return (
            <TouchableOpacity
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => handleCategoryPress(item.id)}
            >
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderTopicCard = ({ item, index }: { item: Topic; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).duration(400)}
            exiting={FadeOut.duration(200)}
        >
            <TouchableOpacity
                style={styles.topicCard}
                onPress={() => handleTopicPress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.topicHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.username.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.username}>{item.username}</Text>
                            <Text style={styles.timestamp}>
                                {getTimeAgo(new Date(item.createdAt))}
                            </Text>
                        </View>
                    </View>

                    {item.isLive && (
                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.topicText} numberOfLines={3}>
                    {item.text}
                </Text>

                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                        {getCategoryLabel(item.category)}
                    </Text>
                </View>

                <View style={styles.topicFooter}>
                    <View style={styles.listenerCount}>
                        <Text style={styles.listenerIcon}>👥</Text>
                        <Text style={styles.listenerText}>
                            {item.listenerCount} {item.listenerCount === 1 ? 'listener' : 'listeners'}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.joinButton}>
                        <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Live Topics</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateTopic}>
                <Text style={styles.createButtonText}>+ New Topic</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎙️</Text>
            <Text style={styles.emptyStateTitle}>No topics yet</Text>
            <Text style={styles.emptyStateText}>
                Be the first to start a conversation!
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateTopic}>
                <Text style={styles.emptyStateButtonText}>Create Topic</Text>
            </TouchableOpacity>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                horizontal
                data={CATEGORIES}
                renderItem={renderCategoryChip}
                keyExtractor={(item) => item.id || 'all'}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
                style={styles.categoriesContainer}
            />

            <FlatList
                data={topics}
                renderItem={renderTopicCard}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={!isLoading ? renderEmptyState : null}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                contentContainerStyle={styles.feedContainer}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={styles.fab} onPress={handleCreateTopic}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

const getCategoryLabel = (category: TopicCategory): string => {
    const cat = CATEGORIES.find((c) => c.id === category);
    return cat ? `${cat.icon} ${cat.label}` : '🌐 General';
};

const generateMockTopics = (page: number): Topic[] => {
    const topics: Topic[] = [];
    const categories = [
        TopicCategory.WAKE_UP,
        TopicCategory.QUESTION,
        TopicCategory.RANDOM,
        TopicCategory.INTERESTING,
    ];
    for (let i = 0; i < 10; i++) {
        const index = (page - 1) * 10 + i;
        topics.push({
            id: `topic_${index}`,
            userId: `user_${index}`,
            username: `User ${index}`,
            text: i % 2 === 0 ? `Ready to discuss the future of AI in voice tech? 🚀 #${index}` : `What's the best morning routine for deep focus? 🧘‍♂️ #${index}`,
            category: categories[index % categories.length],
            listenerCount: Math.floor(Math.random() * 50),
            isLive: Math.random() > 0.3,
            createdAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            roomId: `room_${index}`,
        });
    }
    return topics;
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    categoriesContainer: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    categoriesList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: colors.card,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    categoryLabel: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    categoryLabelActive: {
        color: colors.text,
    },
    feedContainer: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        color: colors.text,
        fontSize: 24,
        fontWeight: '700',
    },
    createButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    createButtonText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    topicCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    topicHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
    },
    userInfo: {
        marginLeft: 12,
    },
    username: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    timestamp: {
        color: colors.gray500,
        fontSize: 12,
        marginTop: 2,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
        marginRight: 4,
    },
    liveText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    topicText: {
        color: colors.text,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 12,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.border,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
    },
    categoryBadgeText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: '600',
    },
    topicFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listenerCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listenerIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    listenerText: {
        color: colors.gray500,
        fontSize: 14,
    },
    joinButton: {
        backgroundColor: colors.speaking,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    joinButtonText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
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
        marginBottom: 24,
    },
    emptyStateButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    emptyStateButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabIcon: {
        color: colors.text,
        fontSize: 32,
        fontWeight: '300',
    },
});
