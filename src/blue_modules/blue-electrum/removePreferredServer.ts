import DefaultPreference from 'react-native-default-preference';
import { GROUP_IO_BLUEWALLET } from '../currency';
import { ELECTRUM_HOST, ELECTRUM_TCP_PORT, ELECTRUM_SSL_PORT } from './constants';

export const removePreferredServer = async () => {
  await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
  console.log('Removing preferred server');
  await DefaultPreference.clear(ELECTRUM_HOST);
  await DefaultPreference.clear(ELECTRUM_TCP_PORT);
  await DefaultPreference.clear(ELECTRUM_SSL_PORT);
};
