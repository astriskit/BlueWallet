import type { Realm } from 'realm';
import { ElectrumClient } from './constants';

export type ElectrumHistory = {
  tx_hash: string;
  height: number;
  address: string;
};

export type MultiGetBalanceResponse = {
  balance: number;
  unconfirmed_balance: number;
  addresses: Record<string, { confirmed: number; unconfirmed: number }>;
};

export type Utxo = {
  height: number;
  value: number;
  address: string;
  txid: string;
  vout: number;
  wif?: string;
};

export type ElectrumTransaction = {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: {
    txid: string;
    vout: number;
    scriptSig: { asm: string; hex: string };
    txinwitness: string[];
    sequence: number;
    addresses?: string[];
    value?: number;
  }[];
  vout: {
    value: number;
    n: number;
    scriptPubKey: {
      asm: string;
      hex: string;
      reqSigs: number;
      type: string;
      addresses: string[];
    };
  }[];
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
};

export type ElectrumTransactionWithHex = ElectrumTransaction & {
  hex: string;
};

export type MempoolTransaction = {
  height: 0;
  tx_hash: string;
  fee: number;
};

export type Peer = {
  host: string;
  ssl?: number;
  tcp?: number;
};

export type ElectrumClientType = typeof ElectrumClient;

export type LatestBlock = { height: number; time: number } | { height: undefined; time: undefined };

export type Client = {
  mainClient: ElectrumClientType | undefined;
  realm: Realm | undefined;
  mainConnected: boolean;
  connectionAttempt: number;
  wasConnectedAtLeastOnce: boolean;
  serverName: string | false;
  disableBatching: boolean;
  latestBlock: LatestBlock;
  currentPeerIndex: number;
};
