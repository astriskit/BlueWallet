import DefaultPreference from 'react-native-default-preference';
import { WidgetCommunicationKeys } from './WidgetCommunicationKeys';

export const setBalanceDisplayAllowed = async (allowed: boolean): Promise<void> => {
  try {
    if (allowed) {
      await DefaultPreference.set(WidgetCommunicationKeys.DisplayBalanceAllowed, '1');
    } else {
      await DefaultPreference.set(WidgetCommunicationKeys.DisplayBalanceAllowed, '0');
    }
  } catch (error) {
    console.error('Failed to set DisplayBalanceAllowed:', error);
  }
};
