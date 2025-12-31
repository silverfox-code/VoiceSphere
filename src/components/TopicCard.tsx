import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StarIcon, CommentIcon } from './Icons';
import { ReactionBar } from './ReactionBar';

interface TopicCardProps {
    topic: string;
    topicId: string;
    author: string;
    commentCount?: number;
    reactions?: { [emoji: string]: number };
    onPress: () => void;
    onReact: (emoji: string) => void;
    activePickerId?: string | null;
    setActivePickerId?: (id: string | null) => void;
}

// Generate a consistent color based on username
const getUserColor = (username: string): string => {
    const colors = [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // amber
        '#EF4444', // red
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#14B8A6', // teal
        '#F97316', // orange
    ];

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const TopicCard = ({
    topic,
    topicId,
    author,
    commentCount = 0,
    reactions = {},
    onPress,
    onReact,
    activePickerId,
    setActivePickerId
}: TopicCardProps) => {
    const userColor = getUserColor(author);
    const initial = author[0]?.toUpperCase() || 'U';

    return (
        <TouchableOpacity onPress={onPress} className="bg-wakie-card p-4 rounded-lg mb-3">
            {/* Topic Content */}
            <Text className="text-white text-base font-medium mb-3">{topic}</Text>

            {/* Author Info */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-2"
                        style={{ backgroundColor: userColor }}
                    >
                        <Text className="text-white font-bold text-sm">{initial}</Text>
                    </View>
                    <View>
                        <Text className="text-white font-medium text-sm">{author}</Text>
                        <View className="flex-row items-center">
                            <StarIcon size={12} />
                            <StarIcon size={12} />
                            <StarIcon size={12} />
                            <StarIcon size={12} color="#4B5563" />
                            <StarIcon size={12} color="#4B5563" />
                        </View>
                    </View>
                </View>

                {/* Comment & Reaction Buttons */}
                <View className="flex-row items-center">
                    {/* Comment Button */}
                    <TouchableOpacity
                        onPress={onPress}
                        className="bg-gray-700/50 rounded-full px-3 py-1.5 flex-row items-center mr-2"
                    >
                        <CommentIcon size={16} color="#9CA3AF" />
                        <Text className="text-white text-sm ml-1">{commentCount}</Text>
                    </TouchableOpacity>

                    {/* Reaction Display */}
                    <ReactionBar
                        reactions={reactions}
                        onReact={onReact}
                        compact
                        pickerId={topicId}
                        activePickerId={activePickerId}
                        setActivePickerId={setActivePickerId}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};
