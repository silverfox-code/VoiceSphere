import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, Alert, Platform, ActionSheetIOS, Modal, ScrollView, KeyboardAvoidingView } from 'react-native';
import { TopicService } from '../services/TopicService';
import { webSocketService } from '../services/WebSocketService';
import { getCurrentUsername } from '../utils/auth';
import { ReactionBar } from '../components/ReactionBar';
import { CommentBubble } from '../components/CommentBubble';
import { SendIcon, UserIcon, MoreVerticalIcon } from '../components/Icons';

export const TopicDetailScreen = ({ route, navigation }: any) => {
    const { topic: initialTopic } = route.params;
    const [topic, setTopic] = useState(initialTopic);
    const [comments, setComments] = useState<any[]>([]);
    const [hiddenCommentIds, setHiddenCommentIds] = useState<Set<string>>(new Set());
    const [newComment, setNewComment] = useState('');
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());
    const [filterUser, setFilterUser] = useState<string | null>(null);
    const [showUserFilter, setShowUserFilter] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [currentUser, setCurrentUser] = useState('User');
    const [userReaction, setUserReaction] = useState<string | null>(null);
    const [commentReactions, setCommentReactions] = useState<{ [commentId: string]: { reactions: { [emoji: string]: number }, userReaction: string | null } }>({});
    const flatListRef = useRef<FlatList>(null);

    const handleReact = async (emoji: string) => {
        // Optimistic update
        if (userReaction === emoji) {
            setUserReaction(null); // Toggle off
        } else {
            setUserReaction(emoji); // Set new reaction
        }
        await TopicService.addReaction(topic.id, currentUser, emoji);
    };

    const handleCommentReact = async (commentId: string, emoji: string) => {
        // Optimistic update for comment reactions
        setCommentReactions(prev => {
            const current = prev[commentId] || { reactions: {}, userReaction: null };
            const newReactions = { ...current.reactions };

            if (current.userReaction === emoji) {
                // Toggle off - remove reaction
                newReactions[emoji] = Math.max(0, (newReactions[emoji] || 1) - 1);
                return { ...prev, [commentId]: { reactions: newReactions, userReaction: null } };
            } else {
                // Remove old reaction if exists
                if (current.userReaction) {
                    newReactions[current.userReaction] = Math.max(0, (newReactions[current.userReaction] || 1) - 1);
                }
                // Add new reaction
                newReactions[emoji] = (newReactions[emoji] || 0) + 1;
                return { ...prev, [commentId]: { reactions: newReactions, userReaction: emoji } };
            }
        });

        await TopicService.addCommentReaction(topic.id, commentId, currentUser, emoji);
    };

    useEffect(() => {
        // Load fixed username first
        const initUser = async () => {
            const username = await getCurrentUsername();
            setCurrentUser(username);
        };
        initUser();

        loadComments();

        // Subscribe to topic channel for real-time updates
        webSocketService.subscribe(`topic_${topic.id}`);



        const unsubscribe = webSocketService.addListener((msg) => {
            if (msg.event_type === 'NEW_COMMENT' && msg.data.topic_id === topic.id) {
                setComments((prev) => {
                    // Prevent duplicates - check if comment already exists
                    if (prev.some(c => c.id === msg.data.id)) {
                        return prev;
                    }
                    return [msg.data, ...prev];
                });
            } else if (msg.event_type === 'COMMENT_DELETED' && msg.data.topic_id === topic.id) {
                setComments((prev) => prev.filter(c => c.id !== msg.data.comment_id));
            } else if (msg.event_type === 'TOPIC_UPDATED' && msg.data.id === topic.id) {
                setTopic(msg.data);
            } else if (msg.event_type === 'COMMENT_REACTION' && msg.data.topic_id === topic.id) {
                // Update comment reactions in real-time
                const { comment_id, emoji, action, old_emoji } = msg.data;
                setCommentReactions(prev => {
                    const current = prev[comment_id] || { reactions: {}, userReaction: null };
                    const newReactions = { ...current.reactions };

                    if (action === 'removed') {
                        newReactions[emoji] = Math.max(0, (newReactions[emoji] || 1) - 1);
                    } else if (action === 'updated') {
                        // Decrement old emoji count
                        if (old_emoji) {
                            newReactions[old_emoji] = Math.max(0, (newReactions[old_emoji] || 1) - 1);
                        }
                        // Increment new emoji count
                        newReactions[emoji] = (newReactions[emoji] || 0) + 1;
                    } else {
                        // Added
                        newReactions[emoji] = (newReactions[emoji] || 0) + 1;
                    }

                    return { ...prev, [comment_id]: { ...current, reactions: newReactions } };
                });
            }
        });

        return () => {
            unsubscribe();
            webSocketService.unsubscribe(`topic_${topic.id}`);
        };
    }, []);

    const loadComments = async () => {
        const data = await TopicService.getComments(topic.id, currentUser);
        setComments(data);

        // Initialize comment reactions state from loaded data
        const reactionsMap: { [commentId: string]: { reactions: { [emoji: string]: number }, userReaction: string | null } } = {};
        data.forEach((c: any) => {
            reactionsMap[c.id] = {
                reactions: c.reactions || {},
                userReaction: c.user_reaction || null
            };
        });
        setCommentReactions(reactionsMap);
    };

    const handleSend = async () => {
        if (!newComment.trim()) return;

        const content = newComment;
        setNewComment('');

        try {
            // Just send the comment - WebSocket will handle displaying it
            await TopicService.addComment(topic.id, currentUser, content);

            // Scroll to top after comment is sent
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }, 100);
        } catch (error) {
            console.error('Error sending comment:', error);
            // Restore the comment text if there was an error
            setNewComment(content);
        }
    };

    const showTopicMenu = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Edit Topic', 'Delete Topic'],
                    destructiveButtonIndex: 2,
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        openEditModal();
                    } else if (buttonIndex === 2) {
                        confirmDeleteTopic();
                    }
                }
            );
        } else {
            Alert.alert(
                'Topic Options',
                'Choose an action',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Edit Topic', onPress: openEditModal },
                    {
                        text: 'Delete Topic',
                        style: 'destructive',
                        onPress: confirmDeleteTopic
                    }
                ]
            );
        }
    };

    const openEditModal = () => {
        setEditTitle(topic.title);
        setEditDescription(topic.description);
        setEditModalVisible(true);
    };

    const handleEditTopic = async () => {
        if (!editTitle.trim() || !editDescription.trim()) {
            Alert.alert('Error', 'Title and description cannot be empty');
            return;
        }

        const updated = await TopicService.updateTopic(topic.id, editTitle, editDescription);
        if (updated) {
            setTopic(updated);
            setEditModalVisible(false);
            Alert.alert('Success', 'Topic updated successfully');
        } else {
            Alert.alert('Error', 'Failed to update topic');
        }
    };

    const confirmDeleteTopic = () => {
        Alert.alert(
            "Delete Topic",
            "Are you sure you want to delete this topic? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await TopicService.deleteTopic(topic.id);
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const confirmDeleteComment = (commentId: string, createdAt: string) => {
        Alert.alert(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setComments(prev => prev.filter(c => c.id !== commentId));
                        await TopicService.deleteComment(topic.id, commentId, createdAt);
                    }
                }
            ]
        );
    };

    const showCommentMenu = (commentId: string, createdAt: string, userId: string) => {
        const isHidden = hiddenCommentIds.has(commentId);
        const isTopicAuthor = currentUser === topic.author;
        const isCommentAuthor = currentUser === userId;

        if (Platform.OS === 'ios') {
            const options: string[] = ['Cancel'];
            let destructiveIndex = -1;

            if (isTopicAuthor) {
                options.push(isHidden ? 'Unhide Comment' : 'Hide Comment');
            }

            if (isCommentAuthor || isTopicAuthor) {
                destructiveIndex = options.length;
                options.push('Delete Comment');
            }

            if (options.length === 1) {
                Alert.alert('No Actions', 'You cannot modify this comment.');
                return;
            }

            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    destructiveButtonIndex: destructiveIndex,
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 0) return;
                    const action = options[buttonIndex];
                    if (action === 'Hide Comment') handleHideComment(commentId);
                    else if (action === 'Unhide Comment') handleUnhideComment(commentId);
                    else if (action === 'Delete Comment') confirmDeleteComment(commentId, createdAt);
                }
            );
        } else {
            const alertOptions: any[] = [{ text: 'Cancel', style: 'cancel' }];

            if (isTopicAuthor) {
                alertOptions.push({
                    text: isHidden ? 'Unhide Comment' : 'Hide Comment',
                    onPress: () => isHidden ? handleUnhideComment(commentId) : handleHideComment(commentId)
                });
            }

            if (isCommentAuthor || isTopicAuthor) {
                alertOptions.push({
                    text: 'Delete Comment',
                    style: 'destructive',
                    onPress: () => confirmDeleteComment(commentId, createdAt)
                });
            }

            if (alertOptions.length === 1) {
                Alert.alert('No Actions', 'You cannot modify this comment.');
                return;
            }

            Alert.alert('Comment Options', `By ${userId}`, alertOptions);
        }
    };

    const handleHideComment = (commentId: string) => {
        setHiddenCommentIds(prev => new Set(prev).add(commentId));
    };

    const handleUnhideComment = (commentId: string) => {
        setHiddenCommentIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
        });
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedComments(new Set());
    };

    const toggleCommentSelection = (commentId: string) => {
        setSelectedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
    };

    const selectAllComments = () => {
        const visibleComments = getFilteredComments();
        setSelectedComments(new Set(visibleComments.map(c => c.id)));
    };

    const deselectAll = () => {
        setSelectedComments(new Set());
    };

    const bulkDelete = () => {
        Alert.alert(
            "Delete Selected",
            `Delete ${selectedComments.size} comment(s)?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        for (const commentId of selectedComments) {
                            const comment = comments.find(c => c.id === commentId);
                            if (comment) {
                                await TopicService.deleteComment(topic.id, commentId, comment.created_at);
                            }
                        }
                        setComments(prev => prev.filter(c => !selectedComments.has(c.id)));
                        setSelectedComments(new Set());
                        setSelectionMode(false);
                    }
                }
            ]
        );
    };

    const bulkHide = () => {
        setHiddenCommentIds(prev => new Set([...prev, ...selectedComments]));
        setSelectedComments(new Set());
        setSelectionMode(false);
    };

    const bulkUnhide = () => {
        setHiddenCommentIds(prev => {
            const newSet = new Set(prev);
            selectedComments.forEach(id => newSet.delete(id));
            return newSet;
        });
        setSelectedComments(new Set());
        setSelectionMode(false);
    };

    const getFilteredComments = () => {
        let filtered = comments;
        if (filterUser) {
            filtered = filtered.filter(c => c.user_id === filterUser);
        }
        return filtered;
    };

    const getUniqueUsers = () => {
        const users = new Set(comments.map(c => c.user_id));
        return Array.from(users);
    };

    const filteredComments = getFilteredComments();
    const hasHiddenComments = hiddenCommentIds.size > 0;

    return (
        <SafeAreaView className="flex-1 bg-wakie-bg">
            {/* Header */}
            <View className="px-4 py-3 border-b border-gray-800 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Text className="text-wakie-primary text-lg font-bold">Back</Text>
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-bold" numberOfLines={1}>
                            {topic.title}
                        </Text>
                        <Text className="text-gray-500 text-xs">Logged in as: {currentUser}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={showTopicMenu} className="p-2">
                    <MoreVerticalIcon size={24} color="#9CA3AF" />
                </TouchableOpacity>
            </View>

            {/* Topic Info */}
            <View className="p-4 border-b border-gray-800 bg-wakie-card">
                <View className="flex-row items-center mb-2">
                    <View className="w-10 h-10 rounded-full bg-gray-600 items-center justify-center mr-3">
                        <UserIcon size={20} color="white" />
                    </View>
                    <View>
                        <Text className="text-white font-bold">{topic.author}</Text>
                        <Text className="text-gray-500 text-xs">Just now</Text>
                    </View>
                </View>
                {topic.description ? (
                    <Text className="text-gray-300 text-base mb-3">{topic.description}</Text>
                ) : null}

                {/* Reaction Bar */}
                <ReactionBar
                    reactions={topic.reactions || {}}
                    userReaction={userReaction}
                    onReact={handleReact}
                    compact={false}
                    alignment="left"
                />

                <Text className="text-gray-500 text-xs mt-2">
                    {comments.length} comment{comments.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Filter and Selection Controls */}
            <View className="px-4 py-2 bg-gray-900 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => setShowUserFilter(!showUserFilter)}
                        className="bg-gray-800 px-3 py-1.5 rounded-full mr-2"
                    >
                        <Text className="text-white text-sm">
                            {filterUser ? `User: ${filterUser}` : 'All Users'}
                        </Text>
                    </TouchableOpacity>

                    {hasHiddenComments && (
                        <Text className="text-gray-500 text-xs">
                            {hiddenCommentIds.size} hidden
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    onPress={toggleSelectionMode}
                    className="bg-wakie-primary px-3 py-1.5 rounded-full"
                >
                    <Text className="text-white text-sm font-bold">
                        {selectionMode ? 'Cancel' : 'Select'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* User Filter Dropdown */}
            {showUserFilter && (
                <View className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            onPress={() => { setFilterUser(null); setShowUserFilter(false); }}
                            className="bg-gray-700 px-3 py-1.5 rounded-full mr-2"
                        >
                            <Text className="text-white text-sm">All</Text>
                        </TouchableOpacity>
                        {getUniqueUsers().map(user => (
                            <TouchableOpacity
                                key={user}
                                onPress={() => { setFilterUser(user); setShowUserFilter(false); }}
                                className={`px-3 py-1.5 rounded-full mr-2 ${filterUser === user ? 'bg-wakie-primary' : 'bg-gray-700'}`}
                            >
                                <Text className="text-white text-sm">{user}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Selection Mode Actions */}
            {selectionMode && (
                <View className="px-4 py-2 bg-gray-800 flex-row items-center justify-between">
                    <View className="flex-row">
                        <TouchableOpacity onPress={selectAllComments} className="mr-3">
                            <Text className="text-wakie-primary font-bold">Select All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={deselectAll}>
                            <Text className="text-gray-400 font-bold">Deselect All</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedComments.size > 0 && (
                        <View className="flex-row">
                            <TouchableOpacity onPress={bulkHide} className="mr-3">
                                <Text className="text-yellow-500 font-bold">Hide ({selectedComments.size})</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={bulkUnhide} className="mr-3">
                                <Text className="text-green-500 font-bold">Unhide</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={bulkDelete}>
                                <Text className="text-red-500 font-bold">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Participants Row */}
            {comments.length > 0 && (
                <View className="px-4 py-2 border-b border-gray-800 flex-row items-center">
                    <View className="flex-row items-center mr-2">
                        {getUniqueUsers().slice(0, 6).map((user, index) => {
                            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
                            let hash = 0;
                            for (let i = 0; i < user.length; i++) {
                                hash = user.charCodeAt(i) + ((hash << 5) - hash);
                            }
                            const color = colors[Math.abs(hash) % colors.length];
                            return (
                                <View
                                    key={user}
                                    className="w-7 h-7 rounded-full items-center justify-center border-2 border-gray-900"
                                    style={{ backgroundColor: color, marginLeft: index > 0 ? -8 : 0 }}
                                >
                                    <Text className="text-white text-xs font-bold">{user[0]?.toUpperCase()}</Text>
                                </View>
                            );
                        })}
                    </View>
                    <Text className="text-gray-400 text-sm">{getUniqueUsers().length} participants</Text>
                </View>
            )}

            {/* Comments List */}
            <FlatList
                ref={flatListRef}
                data={filteredComments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isHidden = hiddenCommentIds.has(item.id);
                    const isSelected = selectedComments.has(item.id);

                    return (
                        <TouchableOpacity
                            onLongPress={() => !selectionMode && showCommentMenu(item.id, item.created_at, item.user_id)}
                            onPress={() => selectionMode && toggleCommentSelection(item.id)}
                            delayLongPress={500}
                            className={`${isHidden ? 'opacity-40' : ''}`}
                        >
                            {selectionMode && (
                                <View className="absolute left-2 top-4 z-10">
                                    <View className={`w-5 h-5 rounded border-2 items-center justify-center ${isSelected ? 'bg-wakie-primary border-wakie-primary' : 'border-gray-500'}`}>
                                        {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
                                    </View>
                                </View>
                            )}
                            <CommentBubble
                                username={item.user_id}
                                content={item.content}
                                timestamp={item.created_at}
                                isCurrentUser={item.user_id === currentUser}
                                reactions={commentReactions[item.id]?.reactions || {}}
                                userReaction={commentReactions[item.id]?.userReaction}
                                onReact={(emoji) => handleCommentReact(item.id, emoji)}
                            />
                            {isHidden && (
                                <Text className="text-yellow-500 text-xs ml-12 -mt-2 mb-2">Hidden</Text>
                            )}
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
            />

            {/* Edit Topic Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-wakie-card rounded-t-3xl p-6">
                        <Text className="text-white text-xl font-bold mb-4">Edit Topic</Text>

                        <Text className="text-gray-400 text-sm mb-2">Title</Text>
                        <TextInput
                            className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
                            value={editTitle}
                            onChangeText={setEditTitle}
                            placeholder="Topic title"
                            placeholderTextColor="#6B7280"
                        />

                        <Text className="text-gray-400 text-sm mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-6"
                            value={editDescription}
                            onChangeText={setEditDescription}
                            placeholder="Topic description"
                            placeholderTextColor="#6B7280"
                            multiline
                            numberOfLines={4}
                        />

                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                className="px-6 py-3 mr-3"
                            >
                                <Text className="text-gray-400 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleEditTopic}
                                className="bg-wakie-primary px-6 py-3 rounded-lg"
                            >
                                <Text className="text-white font-bold">Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View className="px-4 py-3 bg-wakie-card border-t border-gray-800 flex-row items-center">
                    <TextInput
                        className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 mr-3"
                        placeholder="Add a comment..."
                        placeholderTextColor="#6B7280"
                        value={newComment}
                        onChangeText={setNewComment}
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!newComment.trim()}
                        className={`w-10 h-10 rounded-full items-center justify-center ${newComment.trim() ? 'bg-wakie-primary' : 'bg-gray-700'}`}
                    >
                        <SendIcon size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
