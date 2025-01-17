import * as bitcoin from 'bitcoinjs-lib';
import RNFS from 'react-native-fs';
import Realm from 'realm';

import { realm } from './client';

export async function _getRealm() {
  if (realm()) return realm();

  const cacheFolderPath = RNFS.CachesDirectoryPath; // Path to cache folder
  const password = bitcoin.crypto.sha256(Buffer.from('fyegjitkyf[eqjnc.lf')).toString('hex');
  const buf = Buffer.from(password + password, 'hex');
  const encryptionKey = Int8Array.from(buf);
  const path = `${cacheFolderPath}/electrumcache.realm`; // Use cache folder path

  const schema = [
    {
      name: 'Cache',
      primaryKey: 'cache_key',
      properties: {
        cache_key: { type: 'string', indexed: true },
        cache_value: 'string', // stringified json
      },
    },
  ];

  // @ts-ignore schema doesn't match Realm's schema type
  const _realm = await Realm.open({
    schema,
    path,
    encryptionKey,
    excludeFromIcloudBackup: true,
  });

  realm(_realm);

  return _realm;
}
