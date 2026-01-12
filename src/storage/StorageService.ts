/**
 * Storage Service
 * Abstraction layer for AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@logger';

export class StorageService {
    /**
     * Get an item from storage
     */
    static async getItem<T>(key: string): Promise<T | null> {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value !== null) {
                return JSON.parse(value) as T;
            }
            return null;
        } catch (error) {
            logger.error(`Error getting item ${key} from storage`, error as Error);
            return null;
        }
    }

    /**
     * Set an item in storage
     */
    static async setItem(key: string, value: any): Promise<boolean> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error(`Error setting item ${key} in storage`, error as Error);
            return false;
        }
    }

    /**
     * Remove an item from storage
     */
    static async removeItem(key: string): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            logger.error(`Error removing item ${key} from storage`, error as Error);
            return false;
        }
    }

    /**
     * Clear all data from storage
     */
    static async clear(): Promise<boolean> {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (error) {
            logger.error('Error clearing storage', error as Error);
            return false;
        }
    }

    /**
     * Get all keys from storage
     */
    static async getAllKeys(): Promise<readonly string[]> {
        try {
            return await AsyncStorage.getAllKeys();
        } catch (error) {
            logger.error('Error getting all keys from storage', error as Error);
            return [];
        }
    }

    /**
     * Get multiple items from storage
     */
    static async getMultipleItems(keys: string[]): Promise<Record<string, any>> {
        try {
            const pairs = await AsyncStorage.multiGet(keys);
            const result: Record<string, any> = {};

            pairs.forEach(([key, value]) => {
                if (value !== null) {
                    try {
                        result[key] = JSON.parse(value);
                    } catch {
                        result[key] = value;
                    }
                }
            });

            return result;
        } catch (error) {
            logger.error('Error getting multiple items from storage', error as Error);
            return {};
        }
    }
}
