import * as bitcoin from 'bitcoinjs-lib';

import { mainClient } from './client';
import { txhashHeightCache } from './constants';
import { ElectrumHistory } from './types';

export const getTransactionsByAddress = async function (address: string): Promise<ElectrumHistory[]> {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  const script = bitcoin.address.toOutputScript(address);
  const hash = bitcoin.crypto.sha256(script);
  const reversedHash = Buffer.from(hash).reverse();
  const history = await mainClient().blockchainScripthash_getHistory(reversedHash.toString('hex'));
  for (const h of history || []) {
    if (h.tx_hash) txhashHeightCache[h.tx_hash] = h.height; // cache tx height
  }

  return history;
};
