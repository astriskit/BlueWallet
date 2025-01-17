import AsyncStorage from '@react-native-async-storage/async-storage';
import DefaultPreference from 'react-native-default-preference';
import { GROUP_IO_BLUEWALLET } from '../blue_modules/currency';

// Function to get the value from DefaultPreference first, then fallback to AsyncStorage
// as DefaultPreference uses truly native storage.
// If found in AsyncStorage, migrate it to DefaultPreference and remove it from AsyncStorage.
export const getLNDHub = async (lndHubString: string): Promise<string | undefined> => {
  try {
    await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
    let value = (await DefaultPreference.get(lndHubString)) as string | null;

    // If not found, check AsyncStorage and migrate it to DefaultPreference
    if (!value) {
      value = await AsyncStorage.getItem(lndHubString);

      if (value) {
        await DefaultPreference.set(lndHubString, value);
        await AsyncStorage.removeItem(lndHubString);
        console.log('Migrated LNDHub value from AsyncStorage to DefaultPreference');
      }
    }

    return value ?? undefined;
  } catch (error) {
    console.error('Error getting LNDHub preference:', (error as Error).message);
    return undefined;
  }
};

export const setLNDHub = async (value: string, lndHubString: string): Promise<void> => {
  try {
    await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
    await DefaultPreference.set(lndHubString, value);
  } catch (error) {
    console.error('Error setting LNDHub preference:', error);
  }
};

export const clearLNDHub = async (lndHubString: string): Promise<void> => {
  try {
    await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
    await DefaultPreference.clear(lndHubString);
    await AsyncStorage.removeItem(lndHubString);
  } catch (error) {
    console.error('Error clearing LNDHub preference:', error);
  }
};
