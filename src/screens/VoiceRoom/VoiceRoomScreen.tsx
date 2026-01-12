/**
 * Voice Room Screen
 * Production-ready voice room with WebRTC, participant management, and controls
 * @module @screens/VoiceRoom/VoiceRoomScreen
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVoiceRoom } from './hooks/useVoiceRoom';
import { Participant, ParticipantRole } from '@stores/roomStore';
import { NetworkQuality } from '@commonTypes';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../../theme';

type RootStackParamList = {
    VoiceRoom: {
        roomId: string;
        topicId?: string;
        topic: string;
    };
};

type VoiceRoomScreenRouteProp = RouteProp<RootStackParamList, 'VoiceRoom'>;
type VoiceRoomScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'VoiceRoom'
>;

const { width } = Dimensions.get('window');

export const VoiceRoomScreen: React.FC = () => {
    const route = useRoute<VoiceRoomScreenRouteProp>();
    const navigation = useNavigation<VoiceRoomScreenNavigationProp>();
    const { roomId, topicId, topic } = route.params;
    const { colors } = useTheme();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const {
        room,
        participants,
        isJoined,
        isConnecting,
        isMuted,
        isSpeakerMode,
        networkQuality,
        error,
        leaveRoom,
        toggleMute,
        toggleSpeaker,
        raiseHand,
    } = useVoiceRoom({ roomId, topicId, topic });

    const handleLeave = () => {
        Alert.alert(
            'Leave Room?',
            'Are you sure you want to leave this voice room?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: async () => {
                        await leaveRoom();
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const renderParticipant = ({ item }: { item: Participant }) => (
        <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={styles.participantCard}
        >
            <View
                style={[
                    styles.avatar,
                    item.isSpeaking && { borderColor: colors.speaking, borderWidth: 3 },
                ]}
            >
                <Text style={styles.avatarText}>
                    {item.username.charAt(0).toUpperCase()}
                </Text>

                {item.isSpeaking && (
                    <View style={[styles.speakingIndicator, { backgroundColor: colors.speaking }]}>
                        <View style={styles.waveform}>
                            <View style={[styles.wave, styles.wave1]} />
                            <View style={[styles.wave, styles.wave2]} />
                            <View style={[styles.wave, styles.wave3]} />
                        </View>
                    </View>
                )}

                {item.isMuted && (
                    <View style={[styles.mutedBadge, { backgroundColor: colors.error }]}>
                        <Text style={styles.mutedIcon}>🔇</Text>
                    </View>
                )}

                {item.hasHandRaised && (
                    <View style={[styles.handRaisedBadge, { backgroundColor: colors.accent }]}>
                        <Text style={styles.handIcon}>✋</Text>
                    </View>
                )}

                {item.role === ParticipantRole.HOST && (
                    <View style={[styles.hostBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.hostText}>HOST</Text>
                    </View>
                )}
            </View>

            <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>
                {item.username}
            </Text>

            <View style={styles.networkIndicator}>
                <View
                    style={[
                        styles.networkDot,
                        item.networkQuality === NetworkQuality.EXCELLENT && styles.networkExcellent,
                        item.networkQuality === NetworkQuality.GOOD && styles.networkGood,
                        item.networkQuality === NetworkQuality.FAIR && styles.networkFair,
                        item.networkQuality === NetworkQuality.POOR && styles.networkPoor,
                    ]}
                />
            </View>
        </Animated.View>
    );

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>❌ {error}</Text>
                <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.errorButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isConnecting) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>🎙️ Connecting to room...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={handleLeave} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
                    </TouchableOpacity>

                    <View style={[styles.liveIndicator, { backgroundColor: colors.error }]}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>

                    <View style={[styles.participantCount, { backgroundColor: colors.card }]}>
                        <Text style={[styles.participantCountText, { color: colors.text }]}>
                            👥 {participants.length}
                        </Text>
                    </View>
                </View>

                <View style={styles.topicContainer}>
                    <Text style={[styles.topicText, { color: colors.text }]}>{topic}</Text>
                </View>

                <View style={styles.networkQualityContainer}>
                    <View
                        style={[
                            styles.networkQualityDot,
                            networkQuality === NetworkQuality.EXCELLENT && styles.networkExcellent,
                            networkQuality === NetworkQuality.GOOD && styles.networkGood,
                            networkQuality === NetworkQuality.FAIR && styles.networkFair,
                            networkQuality === NetworkQuality.POOR && styles.networkPoor,
                        ]}
                    />
                    <Text style={[styles.networkQualityText, { color: colors.gray500 }]}>
                        {networkQuality.toUpperCase()}
                    </Text>
                </View>
            </View>

            <FlatList
                data={participants}
                renderItem={renderParticipant}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.participantsList}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyStateText, { color: colors.gray500 }]}>
                            🎤 Waiting for participants...
                        </Text>
                    </View>
                }
            />

            <View style={styles.controls}>
                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                        onPress={toggleMute}
                    >
                        <Text style={styles.controlButtonIcon}>
                            {isMuted ? '🔇' : '🎤'}
                        </Text>
                        <Text style={[styles.controlButtonText, { color: colors.text }]}>
                            {isMuted ? 'Unmute' : 'Mute'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlButton, isSpeakerMode && styles.controlButtonActive]}
                        onPress={toggleSpeaker}
                    >
                        <Text style={styles.controlButtonIcon}>
                            {isSpeakerMode ? '🔊' : '🔉'}
                        </Text>
                        <Text style={[styles.controlButtonText, { color: colors.text }]}>
                            {isSpeakerMode ? 'Speaker' : 'Earpiece'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={raiseHand}
                    >
                        <Text style={styles.controlButtonIcon}>✋</Text>
                        <Text style={[styles.controlButtonText, { color: colors.text }]}>Raise Hand</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.leaveButton, { backgroundColor: colors.error }]} onPress={handleLeave}>
                    <Text style={[styles.leaveButtonText, { color: colors.text }]}>Leave Room</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: colors.error,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    errorButton: {
        backgroundColor: colors.card,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    errorButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        padding: 16,
        paddingTop: 48,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 28,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        marginRight: 6,
    },
    liveText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    participantCount: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    participantCountText: {
        fontSize: 14,
        fontWeight: '600',
    },
    topicContainer: {
        marginVertical: 8,
    },
    topicText: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    networkQualityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    networkQualityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    networkQualityText: {
        fontSize: 12,
        fontWeight: '600',
    },
    participantsList: {
        padding: 16,
    },
    participantCard: {
        width: (width - 48) / 3,
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarText: {
        color: colors.text,
        fontSize: 32,
        fontWeight: '700',
    },
    speakingIndicator: {
        position: 'absolute',
        bottom: -10,
        width: 40,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waveform: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    wave: {
        width: 3,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    wave1: {
        height: 8,
    },
    wave2: {
        height: 12,
    },
    wave3: {
        height: 8,
    },
    mutedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mutedIcon: {
        fontSize: 12,
    },
    handRaisedBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    handIcon: {
        fontSize: 14,
    },
    hostBadge: {
        position: 'absolute',
        top: -8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    hostText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    username: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    networkIndicator: {
        marginTop: 4,
    },
    networkDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    networkExcellent: {
        backgroundColor: '#4CAF50',
    },
    networkGood: {
        backgroundColor: '#8BC34A',
    },
    networkFair: {
        backgroundColor: '#FFC107',
    },
    networkPoor: {
        backgroundColor: '#FF5722',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
    },
    controls: {
        backgroundColor: colors.card,
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    controlButton: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        minWidth: 80,
    },
    controlButtonActive: {
        backgroundColor: colors.border,
    },
    controlButtonIcon: {
        fontSize: 32,
        marginBottom: 4,
    },
    controlButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    leaveButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    leaveButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
