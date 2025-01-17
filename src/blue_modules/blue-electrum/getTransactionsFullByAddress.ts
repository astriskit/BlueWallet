import { mainClient } from './client';
import { getTransactionsByAddress } from './getTransactionsByAddress';
import { txhexToElectrumTransaction } from './multiGetTransactionByTxid';
import { ElectrumTransaction } from './types';

export const getTransactionsFullByAddress = async (address: string): Promise<ElectrumTransaction[]> => {
  const txs = await getTransactionsByAddress(address);
  const ret: ElectrumTransaction[] = [];
  for (const tx of txs) {
    let full;
    try {
      full = await mainClient().blockchainTransaction_get(tx.tx_hash, true);
    } catch (error: any) {
      if (String(error?.message ?? error).startsWith('verbose transactions are currently unsupported')) {
        // apparently, stupid esplora instead of returning txhex when it cant return verbose tx started
        // throwing a proper exception. lets fetch txhex manually and decode on our end
        const txhex = await mainClient().blockchainTransaction_get(tx.tx_hash, false);
        full = txhexToElectrumTransaction(txhex);
      } else {
        // nope, its something else
        throw new Error(String(error?.message ?? error));
      }
    }
    full.address = address;
    for (const input of full.vin) {
      // now we need to fetch previous TX where this VIN became an output, so we can see its amount
      let prevTxForVin;
      try {
        prevTxForVin = await mainClient().blockchainTransaction_get(input.txid, true);
      } catch (error: any) {
        if (String(error?.message ?? error).startsWith('verbose transactions are currently unsupported')) {
          // apparently, stupid esplora instead of returning txhex when it cant return verbose tx started
          // throwing a proper exception. lets fetch txhex manually and decode on our end
          const txhex = await mainClient().blockchainTransaction_get(input.txid, false);
          prevTxForVin = txhexToElectrumTransaction(txhex);
        } else {
          // nope, its something else
          throw new Error(String(error?.message ?? error));
        }
      }
      if (prevTxForVin && prevTxForVin.vout && prevTxForVin.vout[input.vout]) {
        input.value = prevTxForVin.vout[input.vout].value;
        // also, we extract destination address from prev output:
        if (prevTxForVin.vout[input.vout].scriptPubKey && prevTxForVin.vout[input.vout].scriptPubKey.addresses) {
          input.addresses = prevTxForVin.vout[input.vout].scriptPubKey.addresses;
        }
        // in bitcoin core 22.0.0+ they removed `.addresses` and replaced it with plain `.address`:
        if (prevTxForVin.vout[input.vout]?.scriptPubKey?.address) {
          input.addresses = [prevTxForVin.vout[input.vout].scriptPubKey.address];
        }
      }
    }

    for (const output of full.vout) {
      if (output?.scriptPubKey && output.scriptPubKey.addresses) output.addresses = output.scriptPubKey.addresses;
      // in bitcoin core 22.0.0+ they removed `.addresses` and replaced it with plain `.address`:
      if (output?.scriptPubKey?.address) output.addresses = [output.scriptPubKey.address];
    }
    full.inputs = full.vin;
    full.outputs = full.vout;
    delete full.vin;
    delete full.vout;
    delete full.hex; // compact
    delete full.hash; // compact
    ret.push(full);
  }

  return ret;
};
