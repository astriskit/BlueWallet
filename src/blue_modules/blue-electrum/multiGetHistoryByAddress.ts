import * as bitcoin from 'bitcoinjs-lib';

import { disableBatching, mainClient } from './client';
import { splitIntoChunks } from './splitIntoChunks';
import { ElectrumHistory } from './types';
import { txhashHeightCache } from './constants';

export const multiGetHistoryByAddress = async function (
  addresses: string[],
  batchsize: number = 100,
): Promise<Record<string, ElectrumHistory[]>> {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  const ret: Record<string, ElectrumHistory[]> = {};

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

    let results = [];

    if (disableBatching()) {
      const promises = [];
      const index2scripthash: Record<number, string> = {};
      for (let promiseIndex = 0; promiseIndex < scripthashes.length; promiseIndex++) {
        index2scripthash[promiseIndex] = scripthashes[promiseIndex];
        promises.push(mainClient().blockchainScripthash_getHistory(scripthashes[promiseIndex]));
      }
      const histories = await Promise.all(promises);
      for (let historyIndex = 0; historyIndex < histories.length; historyIndex++) {
        results.push({ result: histories[historyIndex], param: index2scripthash[historyIndex] });
      }
    } else {
      results = await mainClient().blockchainScripthash_getHistoryBatch(scripthashes);
    }

    for (const history of results) {
      if (history.error) console.warn('multiGetHistoryByAddress():', history.error);
      ret[scripthash2addr[history.param]] = history.result || [];
      for (const result of history.result || []) {
        if (result.tx_hash) txhashHeightCache[result.tx_hash] = result.height; // cache tx height
      }

      for (const hist of ret[scripthash2addr[history.param]]) {
        hist.address = scripthash2addr[history.param];
      }
    }
  }

  return ret;
};
