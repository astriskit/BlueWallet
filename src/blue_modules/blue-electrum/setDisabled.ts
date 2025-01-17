import DefaultPreference from 'react-native-default-preference';
import { GROUP_IO_BLUEWALLET } from '../currency';
import { ELECTRUM_CONNECTION_DISABLED } from './constants';

export async function setDisabled(disabled = true) {
  await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
  console.log('Setting Electrum connection disabled state to:', disabled);
  return DefaultPreference.set(ELECTRUM_CONNECTION_DISABLED, disabled ? '1' : '');
}
