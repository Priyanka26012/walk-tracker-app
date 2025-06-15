import AsyncStorage from '@react-native-async-storage/async-storage';
import { Walk } from '../types/walk';

class StorageService {
  async storeData(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving walks:', error);
      throw error;
    }
  }
  async loadData(key: string): Promise<Walk[]> {
    try {
      const walksJson = await AsyncStorage.getItem(key);
      return walksJson ? JSON.parse(walksJson) : [];
    } catch (error) {
      console.error('Error loading walks:', error);
      return [];
    }
  }
  async deleteData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error deleting walk:', error);
      throw error;
    }
  }
  async loadRawData(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }
}

export const storageService = new StorageService(); 
export const LAST_LOCATION_KEY = '@walk_tracker_last_location';
export const WALK_LIST_STORAGE_KEY = '@walk_tracker_walks_list';