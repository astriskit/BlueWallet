import * as bitcoin from 'bitcoinjs-lib';

import { disableBatching, mainClient } from './client';
import { splitIntoChunks } from './splitIntoChunks';
import { Utxo } from './types';

export const multiGetUtxoByAddress = async function (addresses: string[], batchsize: number = 100): Promise<Record<string, Utxo[]>> {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  const ret: Record<string, any> = {};

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
      // ElectrumPersonalServer doesnt support `blockchain.scripthash.listunspent`
      // electrs OTOH supports it, but we dont know it we are currently connected to it or to EPS
      // so it is pretty safe to do nothing, as caller can derive UTXO from stored transactions
    } else {
      results = await mainClient().blockchainScripthash_listunspentBatch(scripthashes);
    }

    for (const utxos of results) {
      ret[scripthash2addr[utxos.param]] = utxos.result;
      for (const utxo of ret[scripthash2addr[utxos.param]]) {
        utxo.address = scripthash2addr[utxos.param];
        utxo.txid = utxo.tx_hash;
        utxo.vout = utxo.tx_pos;
        delete utxo.tx_pos;
        delete utxo.tx_hash;
      }
    }
  }

  return ret;
};
