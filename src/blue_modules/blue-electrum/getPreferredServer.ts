import DefaultPreference from 'react-native-default-preference';
import { ElectrumServerItem } from '@/src/screen/settings/ElectrumSettings';

import { GROUP_IO_BLUEWALLET } from '../currency';
import { ELECTRUM_HOST, ELECTRUM_TCP_PORT, ELECTRUM_SSL_PORT } from './constants';

export const getPreferredServer = async (): Promise<ElectrumServerItem | undefined> => {
  await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
  const host = (await DefaultPreference.get(ELECTRUM_HOST)) as string;
  const tcpPort = await DefaultPreference.get(ELECTRUM_TCP_PORT);
  const sslPort = await DefaultPreference.get(ELECTRUM_SSL_PORT);

  console.log('Getting preferred server:', { host, tcpPort, sslPort });

  if (!host) {
    console.warn('Preferred server host is undefined');
    return;
  }

  return {
    host,
    tcp: tcpPort ? Number(tcpPort) : undefined,
    ssl: sslPort ? Number(sslPort) : undefined,
  };
};
