/**
 * Enhanced Profile Screen
 * User profile with stats, settings, and account management
 * @module @screens/Profile/UserProfile/ProfileScreen
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Modal,
    FlatList,
    Dimensions,
} from 'react-native';
import { useAuthStore } from '@stores/authStore';
import { useUIStore } from '@stores/uiStore';
import { logger } from '@logger';
import { analytics } from '@analytics/analyticsManager';
import { useTheme, Palettes, ThemeName } from '../../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ProfileScreen: React.FC = () => {
    const { user, logout } = useAuthStore();
    const { colors, themeName } = useTheme();
    const setTheme = useUIStore((state) => state.setTheme);
    const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);

    useEffect(() => {
        analytics.trackScreenView('Profile');
    }, []);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        logger.info('User logging out', 'ProfileScreen', { userId: user?.id });
                        analytics.trackLogout();
                        await logout();
                    },
                },
            ]
        );
    };

    const handleEditProfile = () => {
        logger.debug('Edit profile pressed', 'ProfileScreen');
        analytics.logEvent('edit_profile_clicked');
    };

    const handleThemeSelect = (name: ThemeName) => {
        setTheme(name);
        setIsThemeModalVisible(false);
        logger.info('Theme changed manually', 'ProfileScreen', {
            from: themeName,
            to: name
        });
        analytics.logEvent('theme_changed', { theme: name });
    };

    const formatTalkTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const renderThemeItem = ({ item }: { item: ThemeName }) => {
        const palette = Palettes[item];
        const isSelected = themeName === item;

        return (
            <TouchableOpacity
                style={[
                    styles.themeItem,
                    { backgroundColor: palette.card, borderColor: isSelected ? palette.primary : palette.border }
                ]}
                onPress={() => handleThemeSelect(item)}
            >
                <View style={[styles.themePreview, { backgroundColor: palette.background }]}>
                    <View style={[styles.themeColorDot, { backgroundColor: palette.primary }]} />
                    <View style={[styles.themeColorDot, { backgroundColor: palette.accent }]} />
                    <View style={[styles.themeColorDot, { backgroundColor: palette.speaking }]} />
                </View>
                <View style={styles.themeInfo}>
                    <Text style={[styles.themeName, { color: palette.text }]}>{item}</Text>
                    <Text style={[styles.themeDescription, { color: palette.gray500 }]}>
                        {isSelected ? 'Currently Active' : 'Select to apply'}
                    </Text>
                </View>
                {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: palette.primary }]}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
                    <TouchableOpacity onPress={handleEditProfile}>
                        <Text style={[styles.editButton, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, { backgroundColor: colors.border, borderColor: colors.primary }]}>
                            <Text style={[styles.avatarText, { color: colors.text }]}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.primary, borderColor: colors.card }]}>
                            <Text style={styles.cameraIcon}>📷</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'User Name'}</Text>
                    <Text style={[styles.username, { color: colors.gray500 }]}>@{user?.username || 'username'}</Text>
                    {user?.bio && <Text style={[styles.bio, { color: colors.text }]}>{user.bio}</Text>}

                    <View style={[styles.statsContainer, { borderColor: colors.border }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{user?.stats?.topicsPosted || 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.gray500 }]}>Topics</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{user?.stats?.roomsJoined || 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.gray500 }]}>Rooms</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {formatTalkTime(user?.stats?.totalTalkTime || 0)}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.gray500 }]}>Talk Time</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 20, gap: 20 }}>
                        <TouchableOpacity style={styles.followItem}>
                            <Text style={[styles.followValue, { color: colors.text }]}>{user?.stats?.followersCount || 0}</Text>
                            <Text style={[styles.followLabel, { color: colors.gray500 }]}>Followers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.followItem}>
                            <Text style={[styles.followValue, { color: colors.text }]}>{user?.stats?.followingCount || 0}</Text>
                            <Text style={[styles.followLabel, { color: colors.gray500 }]}>Following</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <Text style={[styles.sectionTitle, { color: colors.gray500 }]}>Account</Text>
                    <MenuItem icon="👤" title="Edit Profile" onPress={handleEditProfile} colors={colors} />
                    <MenuItem icon="🔔" title="Notifications Settings" onPress={() => { }} colors={colors} />
                    <MenuItem icon="🔒" title="Privacy & Security" onPress={() => { }} colors={colors} />
                    <MenuItem icon="🌐" title="Language" subtitle="English" onPress={() => { }} colors={colors} />
                </View>

                <View style={styles.menuSection}>
                    <Text style={[styles.sectionTitle, { color: colors.gray500 }]}>Preferences</Text>
                    <MenuItem
                        icon="🎨"
                        title="Theme"
                        subtitle={themeName}
                        onPress={() => setIsThemeModalVisible(true)}
                        colors={colors}
                    />
                    <MenuItem icon="🔊" title="Audio Settings" onPress={() => { }} colors={colors} />
                    <MenuItem icon="💾" title="Data & Storage" onPress={() => { }} colors={colors} />
                </View>

                <View style={styles.menuSection}>
                    <Text style={[styles.sectionTitle, { color: colors.gray500 }]}>Support</Text>
                    <MenuItem icon="❓" title="Help Center" onPress={() => { }} colors={colors} />
                    <MenuItem icon="📧" title="Contact Us" onPress={() => { }} colors={colors} />
                    <MenuItem icon="⭐" title="Rate VoiceSphere" onPress={() => { }} colors={colors} />
                    <MenuItem icon="📄" title="Terms & Privacy" onPress={() => { }} colors={colors} />
                </View>

                <View style={styles.menuSection}>
                    <Text style={[styles.sectionTitle, { color: colors.gray500 }]}>About</Text>
                    <MenuItem icon="ℹ️" title="Version" subtitle="1.0.0" onPress={() => { }} hideChevron colors={colors} />
                </View>

                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.error }]}
                    onPress={handleLogout}
                >
                    <Text style={[styles.logoutText, { color: colors.text }]}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.gray600 }]}>VoiceSphere © 2026</Text>
                    <Text style={[styles.footerText, { color: colors.gray600 }]}>Made with ❤️ for voice lovers</Text>
                </View>
            </ScrollView>

            {/* Theme Selection Modal */}
            <Modal
                visible={isThemeModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsThemeModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalDismissArea}
                        activeOpacity={1}
                        onPress={() => setIsThemeModalVisible(false)}
                    />
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Theme</Text>
                            <Text style={[styles.modalSubtitle, { color: colors.gray500 }]}>
                                Personalize your VoiceSphere experience
                            </Text>
                        </View>

                        <FlatList
                            data={Object.keys(Palettes) as ThemeName[]}
                            renderItem={renderThemeItem}
                            keyExtractor={(item) => item}
                            contentContainerStyle={styles.themeList}
                            showsVerticalScrollIndicator={false}
                        />

                        <TouchableOpacity
                            style={[styles.closeModalButton, { backgroundColor: colors.card }]}
                            onPress={() => setIsThemeModalVisible(false)}
                        >
                            <Text style={[styles.closeModalText, { color: colors.text }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

interface MenuItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    hideChevron?: boolean;
    colors: any;
}

const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    hideChevron = false,
    colors,
}) => (
    <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.menuItemLeft}>
            <Text style={styles.menuIcon}>{icon}</Text>
            <View style={styles.menuItemText}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.menuSubtitle, { color: colors.gray500 }]}>{subtitle}</Text>}
            </View>
        </View>
        {!hideChevron && <Text style={[styles.chevron, { color: colors.gray600 }]}>›</Text>}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    editButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    profileCard: {
        marginHorizontal: 20,
        marginBottom: 24,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    cameraIcon: {
        fontSize: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        marginBottom: 12,
    },
    bio: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
        opacity: 0.8,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    statDivider: {
        width: 1,
        height: 40,
    },
    followItem: {
        alignItems: 'center',
    },
    followValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    followLabel: {
        fontSize: 14,
        marginTop: 2,
    },
    menuSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    menuItemText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    menuSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    chevron: {
        fontSize: 28,
        fontWeight: '300',
    },
    logoutButton: {
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 24,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    footerText: {
        fontSize: 12,
        marginVertical: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalDismissArea: {
        flex: 1,
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 12,
        paddingBottom: 40,
        paddingHorizontal: 24,
        maxHeight: SCREEN_HEIGHT * 0.8,
        borderTopWidth: 1,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
    },
    themeList: {
        paddingBottom: 20,
    },
    themeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 2,
    },
    themePreview: {
        width: 48,
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginRight: 16,
    },
    themeColorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    themeInfo: {
        flex: 1,
    },
    themeName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 2,
    },
    themeDescription: {
        fontSize: 12,
    },
    selectedBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    closeModalButton: {
        marginTop: 8,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    closeModalText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
