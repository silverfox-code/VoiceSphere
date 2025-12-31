import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ReactionBarProps {
    reactions?: { [emoji: string]: number };
    userReaction?: string | null;
    onReact: (emoji: string) => void;
    compact?: boolean;
    pickerId?: string;
    activePickerId?: string | null;
    setActivePickerId?: (id: string | null) => void;
    alignment?: 'left' | 'right';
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const ReactionBar = ({
    reactions = {},
    userReaction,
    onReact,
    compact = false,
    pickerId,
    activePickerId,
    setActivePickerId,
    alignment = 'right'
}: ReactionBarProps) => {
    const [localShowPicker, setLocalShowPicker] = useState(false);

    const showPicker = pickerId && activePickerId !== undefined
        ? activePickerId === pickerId
        : localShowPicker;

    const setShowPicker = (show: boolean) => {
        if (setActivePickerId && pickerId) {
            setActivePickerId(show ? pickerId : null);
        } else {
            setLocalShowPicker(show);
        }
    };

    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

    const topEmojis = Object.entries(reactions)
        .filter(([_, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([emoji]) => emoji);

    const handleEmojiSelect = (emoji: string) => {
        onReact(emoji);
        setShowPicker(false);
    };

    return (
        <View style={styles.container}>
            {showPicker && (
                <>
                    <TouchableOpacity
                        style={styles.backdrop}
                        onPress={() => setShowPicker(false)}
                    />
                    <View style={[
                        styles.pickerContainer,
                        alignment === 'left' ? { left: 0 } : { right: -10 }
                    ]}>
                        {EMOJIS.map((emoji) => (
                            <TouchableOpacity
                                key={emoji}
                                onPress={() => handleEmojiSelect(emoji)}
                                style={styles.emojiButton}
                            >
                                <Text style={styles.emoji}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            <TouchableOpacity
                onPress={() => setShowPicker(!showPicker)}
                style={styles.button}
            >
                {totalReactions > 0 ? (
                    <View style={styles.reactionDisplay}>
                        <View style={styles.emojiRow}>
                            {topEmojis.map((emoji, index) => (
                                <Text key={emoji} style={[styles.smallEmoji, { marginLeft: index > 0 ? -3 : 0 }]}>
                                    {emoji}
                                </Text>
                            ))}
                        </View>
                        <Text style={styles.count}>{totalReactions}</Text>
                    </View>
                ) : (
                    <View style={styles.likeButton}>
                        <Text style={styles.likeEmoji}>👍</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 100,
    },
    backdrop: {
        position: 'absolute',
        top: -500,
        left: -500,
        right: -500,
        bottom: -500,
        zIndex: 98,
    },
    pickerContainer: {
        position: 'absolute',
        bottom: 32,
        right: -10,
        zIndex: 99,
        backgroundColor: '#4B5563',
        borderRadius: 18,
        paddingHorizontal: 6,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    emojiButton: {
        paddingHorizontal: 5,
        paddingVertical: 3,
    },
    emoji: {
        fontSize: 18,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reactionDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(55, 65, 81, 0.6)',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    emojiRow: {
        flexDirection: 'row',
    },
    smallEmoji: {
        fontSize: 14,
    },
    count: {
        color: 'white',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(55, 65, 81, 0.6)',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    likeEmoji: {
        fontSize: 14,
    },
});
