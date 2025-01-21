import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import Realm from 'realm';

import { _getRealm } from './_getRealm';
import { disableBatching, mainClient } from './client';
import { splitIntoChunks } from './splitIntoChunks';

import { ElectrumTransaction, ElectrumTransactionWithHex } from './types';
import { scriptPubKeyToAddress as segwitBech32ScriptPubKeyToAddress } from '../../class/wallets/utils/segwit-bech32-wallet';
import { scriptPubKeyToAddress as legacyWalletScriptPubKeyToAddress } from '../../class/wallets/utils/legacy-wallet';
import { scriptPubKeyToAddress as segwitP2SHWalletScriptPubKeyToAddress } from '../../class/wallets/utils/segwit-p2sh-wallet';
import { scriptPubKeyToAddress as taprootWalletScriptPubKeyToAddress } from '../../class/wallets/utils/taproot';
import { calculateBlockTime } from './calculateBlockTime';
import { txhashHeightCache } from './constants';
import { estimateCurrentBlockheight } from './estimateCurrentBlockHeight';

export function txhexToElectrumTransaction(txhex: string): ElectrumTransactionWithHex {
  const tx = bitcoin.Transaction.fromHex(txhex);

  const ret: ElectrumTransactionWithHex = {
    txid: tx.getId(),
    hash: tx.getId(),
    version: tx.version,
    size: Math.ceil(txhex.length / 2),
    vsize: tx.virtualSize(),
    weight: tx.weight(),
    locktime: tx.locktime,
    vin: [],
    vout: [],
    hex: txhex,
    blockhash: '',
    confirmations: 0,
    time: 0,
    blocktime: 0,
  };

  if (txhashHeightCache[ret.txid]) {
    // got blockheight where this tx was confirmed
    ret.confirmations = estimateCurrentBlockheight() - txhashHeightCache[ret.txid];
    if (ret.confirmations < 0) {
      // ugly fix for when estimator lags behind
      ret.confirmations = 1;
    }
    ret.time = calculateBlockTime(txhashHeightCache[ret.txid]);
    ret.blocktime = calculateBlockTime(txhashHeightCache[ret.txid]);
  }

  for (const inn of tx.ins) {
    const txinwitness = [];
    if (inn.witness[0]) txinwitness.push(inn.witness[0].toString('hex'));
    if (inn.witness[1]) txinwitness.push(inn.witness[1].toString('hex'));

    ret.vin.push({
      txid: Buffer.from(inn.hash).reverse().toString('hex'),
      vout: inn.index,
      scriptSig: { hex: inn.script.toString('hex'), asm: '' },
      txinwitness,
      sequence: inn.sequence,
    });
  }

  let n = 0;
  for (const out of tx.outs) {
    const value = new BigNumber(out.value).dividedBy(100000000).toNumber();
    let address: false | string = false;
    let type: false | string = false;

    if (segwitBech32ScriptPubKeyToAddress(out.script.toString('hex'))) {
      address = segwitBech32ScriptPubKeyToAddress(out.script.toString('hex'));
      type = 'witness_v0_keyhash';
    } else if (segwitP2SHWalletScriptPubKeyToAddress(out.script.toString('hex'))) {
      address = segwitP2SHWalletScriptPubKeyToAddress(out.script.toString('hex'));
      type = '???'; // TODO
    } else if (legacyWalletScriptPubKeyToAddress(out.script.toString('hex'))) {
      address = legacyWalletScriptPubKeyToAddress(out.script.toString('hex'));
      type = '???'; // TODO
    } else {
      address = taprootWalletScriptPubKeyToAddress(out.script.toString('hex'));
      type = 'witness_v1_taproot';
    }

    if (!address) {
      throw new Error('Internal error: unable to decode address from output script');
    }

    ret.vout.push({
      value,
      n,
      scriptPubKey: {
        asm: '',
        hex: out.script.toString('hex'),
        reqSigs: 1, // todo
        type,
        addresses: [address],
      },
    });
    n++;
  }
  return ret;
}

type MultiGetTransactionByTxidResult<T extends boolean> = T extends true ? Record<string, ElectrumTransaction> : Record<string, string>;

// TODO: this function returns different results based on the value of `verboseParam`, consider splitting it into two
export async function multiGetTransactionByTxid<T extends boolean>(
  txids: string[],
  verbose: T,
  batchsize: number = 45,
): Promise<MultiGetTransactionByTxidResult<T>> {
  txids = txids.filter(txid => !!txid); // failsafe: removing 'undefined' or other falsy stuff from txids array
  // this value is fine-tuned so althrough wallets in test suite will occasionally
  // throw 'response too large (over 1,000,000 bytes', test suite will pass
  if (!mainClient()) throw new Error('Electrum client is not connected');
  const ret: MultiGetTransactionByTxidResult<T> = {};
  txids = [...new Set(txids)]; // deduplicate just for any case

  // lets try cache first:
  const realm = await _getRealm();
  const cacheKeySuffix = verbose ? '_verbose' : '_non_verbose';
  const keysCacheMiss = [];
  for (const txid of txids) {
    const jsonString = realm.objectForPrimaryKey('Cache', txid + cacheKeySuffix); // search for a realm object with a primary key
    if (jsonString && jsonString.cache_value) {
      try {
        ret[txid] = JSON.parse(jsonString.cache_value as string);
      } catch (error) {
        console.log(error, 'cache failed to parse', jsonString.cache_value);
      }
    }

    if (!ret[txid]) keysCacheMiss.push(txid);
  }

  if (keysCacheMiss.length === 0) {
    return ret;
  }

  txids = keysCacheMiss;
  // end cache

  const chunks = splitIntoChunks(txids, batchsize);
  for (const chunk of chunks) {
    let results = [];

    if (disableBatching()) {
      try {
        // in case of ElectrumPersonalServer it might not track some transactions (like source transactions for our transactions)
        // so we wrap it in try-catch. note, when `Promise.all` fails we will get _zero_ results, but we have a fallback for that
        const promises = [];
        const index2txid: Record<number, string> = {};
        for (let promiseIndex = 0; promiseIndex < chunk.length; promiseIndex++) {
          const txid = chunk[promiseIndex];
          index2txid[promiseIndex] = txid;
          promises.push(mainClient().blockchainTransaction_get(txid, verbose));
        }

        const transactionResults = await Promise.all(promises);
        for (let resultIndex = 0; resultIndex < transactionResults.length; resultIndex++) {
          let tx = transactionResults[resultIndex];
          if (typeof tx === 'string' && verbose) {
            // apparently electrum server (EPS?) didnt recognize VERBOSE parameter, and  sent us plain txhex instead of decoded tx.
            // lets decode it manually on our end then:
            tx = txhexToElectrumTransaction(tx);
          }
          const txid = index2txid[resultIndex];
          results.push({ result: tx, param: txid });
        }
      } catch (error: any) {
        if (String(error?.message ?? error).startsWith('verbose transactions are currently unsupported')) {
          // electrs-esplora. cant use verbose, so fetching txs one by one and decoding locally
          for (const txid of chunk) {
            try {
              let tx = await mainClient().blockchainTransaction_get(txid, false);
              tx = txhexToElectrumTransaction(tx);
              results.push({ result: tx, param: txid });
            } catch (err) {
              console.log(err);
            }
          }
        } else {
          // fallback. pretty sure we are connected to EPS.  we try getting transactions one-by-one. this way we wont
          // fail and only non-tracked by EPS transactions will be omitted
          for (const txid of chunk) {
            try {
              let tx = await mainClient().blockchainTransaction_get(txid, verbose);
              if (typeof tx === 'string' && verbose) {
                // apparently electrum server (EPS?) didnt recognize VERBOSE parameter, and  sent us plain txhex instead of decoded tx.
                // lets decode it manually on our end then:
                tx = txhexToElectrumTransaction(tx);
              }
              results.push({ result: tx, param: txid });
            } catch (err) {
              console.log(err);
            }
          }
        }
      }
    } else {
      results = await mainClient().blockchainTransaction_getBatch(chunk, verbose);
    }

    for (const txdata of results) {
      if (txdata.error && txdata.error.code === -32600) {
        // response too large
        // lets do single call, that should go through okay:
        txdata.result = await mainClient().blockchainTransaction_get(txdata.param, false);
        // since we used VERBOSE=false, server sent us plain txhex which we must decode on our end:
        txdata.result = txhexToElectrumTransaction(txdata.result);
      }
      ret[txdata.param] = txdata.result;
      // @ts-ignore: hex property
      if (ret[txdata.param]) delete ret[txdata.param].hex; // compact
    }
  }

  // in bitcoin core 22.0.0+ they removed `.addresses` and replaced it with plain `.address`:
  for (const txid of Object.keys(ret)) {
    const tx = ret[txid];
    if (typeof tx === 'string') continue;
    for (const vout of tx?.vout ?? []) {
      // @ts-ignore: address is not in type definition
      if (vout?.scriptPubKey?.address) vout.scriptPubKey.addresses = [vout.scriptPubKey.address];
    }
  }

  // saving cache:
  realm.write(() => {
    for (const txid of Object.keys(ret)) {
      const tx = ret[txid];
      // dont cache immature txs, but only for 'verbose', since its fully decoded tx jsons. non-verbose are just plain
      // strings txhex
      if (verbose && typeof tx !== 'string' && (!tx?.confirmations || tx.confirmations < 7)) {
        continue;
      }

      realm.create(
        'Cache',
        {
          cache_key: txid + cacheKeySuffix,
          cache_value: JSON.stringify(ret[txid]),
        },
        Realm.UpdateMode.Modified,
      );
    }
  });

  return ret;
}
