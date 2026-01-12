import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Alert,
    Image,
    NativeModules,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme';
import { API_BASE_URL, API_ENDPOINTS } from '@appConstants/ApiEndpoints';
import { logger } from '@logger';

const { width, height } = Dimensions.get('window');
const { GoogleConfig, DeviceInfo } = NativeModules;

export const HomeScreen = () => {
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);
    const navigation = useNavigation<any>();
    const { colors } = useTheme();

    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        // Get Web Client ID from native module
        const webClientId = GoogleConfig?.WEB_CLIENT_ID || '';

        if (!webClientId) {
            console.warn('Google Web Client ID missing');
            return;
        }

        // Configure Google Sign-In
        GoogleSignin.configure({
            webClientId: webClientId,
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });

        // Check if user is already signed in
        checkIsSignedIn();
    }, []);

    const checkIsSignedIn = async () => {
        try {
            const currentUser = await GoogleSignin.getCurrentUser();
            if (currentUser) {
                setUserInfo(currentUser);
            }
        } catch (error) {
            console.error('Error checking sign-in status:', error);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsSigningIn(true);
            await GoogleSignin.hasPlayServices();
            const signInResponse = await GoogleSignin.signIn();
            setUserInfo(signInResponse);
            const token = signInResponse?.data?.idToken;

            console.log('Sign In Successful', signInResponse?.data?.user);
            console.log('Sign In Successful', signInResponse?.data);

            const uuid = DeviceInfo?.UNIQUE_ID || 'unknown-device';

            // Call login API
            try {
                logger.info('Calling Login API', 'HomeScreen', { uuid });
                const loginResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token,
                        uuid,
                    }),
                });

                const responseData = await loginResponse.json();
                logger.info('Login API Response', 'HomeScreen', responseData);
                console.log('Login API Response:', responseData);
            } catch (apiError) {
                logger.error('Login API Error', apiError as Error, 'HomeScreen');
                console.error('Login API Error:', apiError);
            }

            Alert.alert(
                'Sign In Successful',
                `Welcome, ${(signInResponse as any)?.data?.user?.name || (signInResponse as any)?.user?.name || 'User'}!`,
                [
                    {
                        text: 'Continue',
                        onPress: () => {
                            navigation.navigate('Main');
                        },
                    },
                ]
            );
        } catch (error: any) {
            setIsSigningIn(false);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                Alert.alert('Sign In Cancelled', 'You cancelled the sign-in process.');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Alert.alert('Sign In In Progress', 'Sign in is already in progress.');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Google Play Services not available or outdated.');
            } else {
                Alert.alert('Sign In Failed', `Error: ${error.message}`);
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await GoogleSignin.signOut();
            setUserInfo(null);
            Alert.alert('Signed Out', 'You have been signed out successfully.');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.gradientBackground}>
                <View style={[styles.gradientCircle1, { backgroundColor: colors.accent }]} />
                <View style={[styles.gradientCircle2, { backgroundColor: colors.primary }]} />
                <View style={[styles.gradientCircle3, { backgroundColor: colors.speaking }]} />
            </View>

            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={[styles.logoCircle, { backgroundColor: colors.accentTransparent, borderColor: colors.accent }]}>
                        <Text style={styles.logoText}>🎙️</Text>
                    </View>
                    <Text style={[styles.appName, { color: colors.text }]}>VoiceSphere</Text>
                    <Text style={[styles.tagline, { color: colors.gray400 }]}>Connect through conversations</Text>
                </View>

                {userInfo ? (
                    <View style={styles.userInfoContainer}>
                        {(userInfo?.data?.user?.photo || userInfo?.user?.photo) && (
                            <Image
                                source={{ uri: userInfo?.data?.user?.photo || userInfo?.user?.photo }}
                                style={[styles.userPhoto, { borderColor: colors.accent }]}
                            />
                        )}
                        <Text style={[styles.welcomeText, { color: colors.gray400 }]}>Welcome back!</Text>
                        <Text style={[styles.userName, { color: colors.text }]}>{userInfo?.data?.user?.name || userInfo?.user?.name}</Text>
                        <Text style={[styles.userEmail, { color: colors.gray500 }]}>{userInfo?.data?.user?.email || userInfo?.user?.email}</Text>
                    </View>
                ) : (
                    <View style={styles.welcomeContainer}>
                        <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome to VoiceSphere</Text>
                        <Text style={[styles.welcomeDescription, { color: colors.gray400 }]}>
                            Join engaging voice conversations with people around the world.
                            Sign in to get started.
                        </Text>
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    {!userInfo ? (
                        <TouchableOpacity
                            style={[styles.googleButton, { backgroundColor: colors.text }]}
                            onPress={handleGoogleSignIn}
                            disabled={isSigningIn}
                            activeOpacity={0.8}
                        >
                            {isSigningIn ? (
                                <ActivityIndicator size="small" color={colors.background} />
                            ) : (
                                <>
                                    <View style={styles.googleIconContainer}>
                                        <Text style={[styles.googleIcon, { color: colors.text }]}>G</Text>
                                    </View>
                                    <Text style={[styles.googleButtonText, { color: colors.gray900 }]}>Sign in with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.continueButton, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate('Main')}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.continueButtonText, { color: colors.text }]}>Continue to App</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.signOutButton, { borderColor: colors.gray600 }]}
                                onPress={handleSignOut}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.signOutButtonText, { color: colors.gray400 }]}>Sign Out</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.gray500 }]}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </Text>
                </View>
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gradientBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    gradientCircle1: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        opacity: 0.1,
        top: -width * 0.5,
        left: -width * 0.3,
    },
    gradientCircle2: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        opacity: 0.1,
        bottom: -width * 0.4,
        right: -width * 0.3,
    },
    gradientCircle3: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        opacity: 0.08,
        top: height * 0.3,
        right: -width * 0.2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingTop: 80,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
    },
    logoText: {
        fontSize: 48,
    },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 16,
        fontWeight: '400',
    },
    userInfoContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    userPhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 3,
    },
    welcomeText: {
        fontSize: 20,
        marginBottom: 8,
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
    },
    welcomeContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    welcomeDescription: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        marginTop: 20,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        elevation: 8,
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    googleIcon: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    googleButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    continueButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        elevation: 8,
        marginBottom: 12,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    signOutButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 2,
    },
    signOutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});
