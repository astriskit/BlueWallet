import * as bitcoin from 'bitcoinjs-lib';

import { disableBatching, mainClient } from './client';
import { splitIntoChunks } from './splitIntoChunks';
import { MultiGetBalanceResponse } from './types';

export const multiGetBalanceByAddress = async (addresses: string[], batchsize: number = 200): Promise<MultiGetBalanceResponse> => {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  const ret = {
    balance: 0,
    unconfirmed_balance: 0,
    addresses: {} as Record<string, { confirmed: number; unconfirmed: number }>,
  };

  const chunks = splitIntoChunks(addresses, batchsize);
  for (const chunk of chunks) {
    const scripthashes = [];
    const scripthash2addr: Record<string, string> = {};
    for (const addr of chunk) {
      const script = bitcoin.address.toOutputScript(addr);
      const hash = bitcoin.crypto.sha256(script);
      const reversedHash = Buffer.from(hash).reverse().toString('hex');
      scripthashes.push(reversedHash);
      scripthash2addr[reversedHash] = addr;
    }

    let balances = [];

    if (disableBatching()) {
      const promises = [];
      const index2scripthash: Record<number, string> = {};
      for (let promiseIndex = 0; promiseIndex < scripthashes.length; promiseIndex++) {
        promises.push(mainClient().blockchainScripthash_getBalance(scripthashes[promiseIndex]));
        index2scripthash[promiseIndex] = scripthashes[promiseIndex];
      }
      const promiseResults = await Promise.all(promises);
      for (let resultIndex = 0; resultIndex < promiseResults.length; resultIndex++) {
        balances.push({ result: promiseResults[resultIndex], param: index2scripthash[resultIndex] });
      }
    } else {
      balances = await mainClient().blockchainScripthash_getBalanceBatch(scripthashes);
    }

    for (const bal of balances) {
      if (bal.error) console.warn('multiGetBalanceByAddress():', bal.error);
      ret.balance += +bal.result.confirmed;
      ret.unconfirmed_balance += +bal.result.unconfirmed;
      ret.addresses[scripthash2addr[bal.param]] = bal.result;
    }
  }

  return ret;
};
