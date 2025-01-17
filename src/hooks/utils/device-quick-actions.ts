import AsyncStorage from '@react-native-async-storage/async-storage';

const DeviceQuickActionsStorageKey = 'DeviceQuickActionsEnabled';

export async function setEnabled(enabled: boolean = true): Promise<void> {
  await AsyncStorage.setItem(DeviceQuickActionsStorageKey, JSON.stringify(enabled));
}

export async function getEnabled(): Promise<boolean> {
  try {
    const isEnabled = await AsyncStorage.getItem(DeviceQuickActionsStorageKey);
    if (isEnabled === null) {
      await setEnabled(true);
      return true;
    }
    return !!JSON.parse(isEnabled);
  } catch {
    return true;
  }
}
