import * as bitcoin from 'bitcoinjs-lib';

import { mainClient } from './client';

export const getBalanceByAddress = async function (address: string): Promise<{ confirmed: number; unconfirmed: number }> {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  const script = bitcoin.address.toOutputScript(address);
  const hash = bitcoin.crypto.sha256(script);
  const reversedHash = Buffer.from(hash).reverse();
  const balance = await mainClient().blockchainScripthash_getBalance(reversedHash.toString('hex'));
  balance.addr = address;
  return balance;
};
