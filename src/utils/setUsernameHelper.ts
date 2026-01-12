/**
 * Manual Username Setter for Testing
 * 
 * This utility allows you to manually set usernames on each simulator for testing.
 * Run this in the React Native debugger console or add a temporary button in the app.
 * 
 * Usage in React Native Debugger Console:
 * 
 * // For Simulator 1 (set as SilverFox):
 * import { setUsername } from './src/utils/auth';
 * setUsername('SilverFox');
 * 
 * // For Simulator 2 (set as Chip):
 * import { setUsername } from './src/utils/auth';
 * setUsername('Chip');
 * 
 * // To clear and reset:
 * import { clearUsername } from './src/utils/auth';
 * clearUsername();
 */


import { setUsername, clearUsername, getCurrentUsername } from './auth';

// // Export for easy access
export { setUsername, clearUsername, getCurrentUsername };

// Helper function to set username from app (can be called from a dev menu)
export const setUsernameForTesting = async (username: string) => {
    await setUsername(username);
    console.log(`Username set to: ${username}`);
    const current = await getCurrentUsername();
    console.log(`Current username: ${current}`);
};
