/**
 * Returns random electrum server out of list of servers
 * previous electrum server told us. Nearly half of them is
 * usually offline.
 * Not used for now.
 */

import DefaultPreference from 'react-native-default-preference';
import { Peer } from './types';
import { defaultPeer, storageKey } from './constants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getRandomDynamicPeer(): Promise<Peer> {
  try {
    let peers = JSON.parse((await DefaultPreference.get(storageKey)) as string);
    peers = peers.sort(() => Math.random() - 0.5); // shuffle
    for (const peer of peers) {
      const ret: Peer = { host: peer[0], ssl: peer[1] };
      ret.host = peer[1];

      if (peer[1] === 's') {
        ret.ssl = peer[2];
      } else {
        ret.tcp = peer[2];
      }

      for (const item of peer[2]) {
        if (item.startsWith('t')) {
          ret.tcp = item.replace('t', '');
        }
      }
      if (ret.host && ret.tcp) return ret;
    }

    return defaultPeer; // failed to find random client, using default
  } catch (_) {
    return defaultPeer; // smth went wrong, using default
  }
}
