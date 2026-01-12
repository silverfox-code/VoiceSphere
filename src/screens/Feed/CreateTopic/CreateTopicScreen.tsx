import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { logger } from '@logger';
import { analytics } from '@analytics/analyticsManager';
import { useTheme } from '../../../theme';

export const CreateTopicScreen = ({ navigation }: any) => {
    const [title, setTitle] = useState('');
    const [currentUser, setCurrentUser] = useState('User');
    const { colors } = useTheme();

    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        analytics.trackScreenView('CreateTopic');
    }, []);

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        try {
            logger.info('Creating new topic', 'CreateTopicScreen', { title });
            // TODO: Implement actual topic creation logic with TopicStore
            analytics.logEvent('topic_created', { title_length: title.length });
            navigation.goBack();
        } catch (error) {
            logger.error('Failed to create topic', error as Error, 'CreateTopicScreen');
            Alert.alert('Error', 'Failed to create topic');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Topic</Text>
                    <TouchableOpacity onPress={handleCreate}>
                        <Text style={[styles.postButton, !title.trim() && styles.disabledButton]}>Post</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{currentUser.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.userLabel}>Posting as {currentUser}</Text>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="What do you want to talk about?"
                        placeholderTextColor={colors.gray500}
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                        multiline
                        maxLength={200}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.charCount}>{title.length}/200</Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
    },
    cancelButton: {
        color: colors.gray500,
        fontSize: 16,
        fontWeight: '600',
    },
    postButton: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    userLabel: {
        color: colors.gray500,
        fontSize: 14,
    },
    input: {
        color: colors.text,
        fontSize: 22,
        fontWeight: '600',
        minHeight: 120,
        textAlignVertical: 'top',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    charCount: {
        color: colors.gray600,
        fontSize: 12,
    },
});
