import { TransactionInput } from './TransactionInput';
import { TransactionOutput } from './TransactionOutput';

export type Transaction = {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
  received?: number;
  value?: number;

  /**
   * if known, who is on the other end of the transaction (BIP47 payment code)
   */
  counterparty?: string;
};
