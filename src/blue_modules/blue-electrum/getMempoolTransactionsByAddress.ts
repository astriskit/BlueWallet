import * as bitcoin from 'bitcoinjs-lib';

import { mainClient } from './client';
import { MempoolTransaction } from './types';

export const getMempoolTransactionsByAddress = async function (address: string): Promise<MempoolTransaction[]> {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  const script = bitcoin.address.toOutputScript(address);
  const hash = bitcoin.crypto.sha256(script);
  const reversedHash = Buffer.from(hash).reverse();
  return mainClient().blockchainScripthash_getMempool(reversedHash.toString('hex'));
};
