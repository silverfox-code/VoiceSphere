import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CommentBubbleProps {
    username: string;
    content: string;
    timestamp: string;
    isCurrentUser?: boolean;
    reactions?: { [emoji: string]: number };
    userReaction?: string | null;
    onReact?: (emoji: string) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const getUserColor = (username: string): string => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const CommentBubble = ({
    username,
    content,
    timestamp,
    isCurrentUser = false,
    reactions = {},
    userReaction,
    onReact
}: CommentBubbleProps) => {
    const [showPicker, setShowPicker] = useState(false);
    const userColor = getUserColor(username);
    const initial = username[0]?.toUpperCase() || 'U';
    const formattedTime = formatTime(timestamp);

    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
    const topEmojis = Object.entries(reactions)
        .filter(([_, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([emoji]) => emoji);

    const handleEmojiSelect = (emoji: string) => {
        onReact?.(emoji);
        setShowPicker(false);
    };

    return (
        <View style={styles.container}>
            {/* User Avatar */}
            <View style={[styles.avatar, { backgroundColor: userColor }]}>
                <Text style={styles.avatarText}>{initial}</Text>
            </View>

            {/* Comment Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.username}>{username}</Text>
                    <Text style={styles.time}>{formattedTime}</Text>
                </View>

                <View style={styles.bubble}>
                    <Text style={styles.bubbleText}>{content}</Text>
                </View>

                {/* Reaction Area */}
                <View style={styles.reactionArea}>
                    {showPicker && (
                        <>
                            <TouchableOpacity style={styles.backdrop} onPress={() => setShowPicker(false)} />
                            <View style={styles.pickerContainer}>
                                {EMOJIS.map((emoji) => (
                                    <TouchableOpacity key={emoji} onPress={() => handleEmojiSelect(emoji)} style={styles.emojiButton}>
                                        <Text style={styles.emoji}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    <TouchableOpacity onPress={() => setShowPicker(!showPicker)} style={styles.likeButton}>
                        {totalReactions > 0 ? (
                            <View style={styles.reactionDisplay}>
                                {topEmojis.map((emoji, index) => (
                                    <Text key={emoji} style={[styles.smallEmoji, { marginLeft: index > 0 ? -2 : 0 }]}>{emoji}</Text>
                                ))}
                                <Text style={styles.count}>{totalReactions}</Text>
                            </View>
                        ) : (
                            <Text style={styles.likeText}>👍 Like</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', marginBottom: 12, paddingHorizontal: 8 },
    avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    content: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    username: { color: 'white', fontWeight: '600', fontSize: 14 },
    time: { color: '#6B7280', fontSize: 12, marginLeft: 8 },
    bubble: { backgroundColor: 'rgba(55, 65, 81, 0.7)', borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', maxWidth: '85%' },
    bubbleText: { color: 'white', fontSize: 15 },
    reactionArea: { position: 'relative', marginTop: 4 },
    backdrop: { position: 'absolute', top: -500, left: -500, right: -500, bottom: -500, zIndex: 98 },
    pickerContainer: { position: 'absolute', bottom: 28, left: 0, zIndex: 99, backgroundColor: '#4B5563', borderRadius: 18, paddingHorizontal: 6, paddingVertical: 4, flexDirection: 'row' },
    emojiButton: { paddingHorizontal: 5, paddingVertical: 3 },
    emoji: { fontSize: 18 },
    likeButton: { flexDirection: 'row', alignItems: 'center' },
    reactionDisplay: { flexDirection: 'row', alignItems: 'center' },
    smallEmoji: { fontSize: 14 },
    count: { color: '#9CA3AF', fontSize: 12, marginLeft: 4 },
    likeText: { color: '#6B7280', fontSize: 13 },
});
