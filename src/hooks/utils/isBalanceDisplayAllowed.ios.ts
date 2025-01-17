import DefaultPreference from 'react-native-default-preference';
import { WidgetCommunicationKeys } from './WidgetCommunicationKeys';

export const isBalanceDisplayAllowed = async (): Promise<boolean> => {
  try {
    const displayBalance = await DefaultPreference.get(WidgetCommunicationKeys.DisplayBalanceAllowed);
    if (displayBalance === '1') {
      return true;
    } else if (displayBalance === '0') {
      return false;
    } else {
      // Preference not set, initialize it to '1' (allowed) and return true
      await DefaultPreference.set(WidgetCommunicationKeys.DisplayBalanceAllowed, '1');
      return true;
    }
  } catch (error) {
    console.error('Failed to get DisplayBalanceAllowed:', error);
    return true;
  }
};
