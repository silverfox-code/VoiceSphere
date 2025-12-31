import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple device-based username assignment
// This will consistently assign the same username to each device
const getDeviceBasedUsername = async (): Promise<string> => {
    try {
        // Check if we already have a stored username
        let username = await AsyncStorage.getItem('fixed_username');

        if (!username) {
            // Generate a simple device ID based on timestamp
            // First device to install will be SilverFox, second will be Chip
            const installTime = await AsyncStorage.getItem('install_time');

            if (!installTime) {
                // This is first install - assign based on random
                const now = Date.now();
                await AsyncStorage.setItem('install_time', now.toString());

                // Use odd/even to assign username
                username = (now % 2 === 0) ? 'SilverFox' : 'Chip';
            } else {
                // Fallback
                username = 'User';
            }

            await AsyncStorage.setItem('fixed_username', username);
        }

        return username;
    } catch {
        return 'User';
    }
};

// Clear username (for testing - allows reassignment)
export const clearUsername = async () => {
    await AsyncStorage.removeItem('fixed_username');
    await AsyncStorage.removeItem('install_time');
};

export const getCurrentUsername = async (): Promise<string> => {
    return await getDeviceBasedUsername();
};

// For manual override during testing
export const setUsername = async (username: string) => {
    await AsyncStorage.setItem('fixed_username', username);
};
