import DefaultPreference from 'react-native-default-preference';
import { GROUP_IO_BLUEWALLET } from '../currency';
import { ELECTRUM_CONNECTION_DISABLED } from './constants';

export async function isDisabled(): Promise<boolean> {
  let result;
  try {
    await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
    const savedValue = await DefaultPreference.get(ELECTRUM_CONNECTION_DISABLED);
    console.log('Getting Electrum connection disabled state:', savedValue);
    if (savedValue === null) {
      result = false;
    } else {
      result = savedValue;
    }
  } catch (error) {
    console.error('Error getting Electrum connection disabled state:', error);
    result = false;
  }
  return !!result;
}
