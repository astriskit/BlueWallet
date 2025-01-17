import DefaultPreference from 'react-native-default-preference';
import { Peer } from './types';
import { GROUP_IO_BLUEWALLET } from '../currency';
import { ELECTRUM_HOST, ELECTRUM_TCP_PORT, ELECTRUM_SSL_PORT } from './constants';

export async function getSavedPeer(): Promise<Peer | null> {
  await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
  const host = (await DefaultPreference.get(ELECTRUM_HOST)) as string;
  const tcpPort = await DefaultPreference.get(ELECTRUM_TCP_PORT);
  const sslPort = await DefaultPreference.get(ELECTRUM_SSL_PORT);

  console.log('Getting saved peer:', { host, tcpPort, sslPort });

  if (!host) {
    return null;
  }

  if (sslPort) {
    return { host, ssl: Number(sslPort) };
  }

  if (tcpPort) {
    return { host, tcp: Number(tcpPort) };
  }

  return null;
}
