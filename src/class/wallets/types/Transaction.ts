import { TransactionInput } from './TransactionInput';
import { TransactionOutput } from './TransactionOutput';

export type Transaction = {
  txid: string;
  hash: string;
  version?: number;
  size?: number;
  vsize?: number;
  weight?: number;
  locktime?: number;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  blockhash?: string;
  confirmations?: number;
  time: number;
  blocktime?: number;
  received?: number | string;
  value?: number;

  /**
   * if known, who is on the other end of the transaction (BIP47 payment code)
   */
  counterparty?: string;

  // Ethereum specific fields
  isEthereum?: boolean;
  blockNumber?: number;
  network?: string;
  isInternal?: boolean;
  isError?: boolean;
  gasPrice?: string;
  gasUsed?: string;
  fee?: number;
  nonce?: number;
  // Possible status values: pending, confirmed, failed, cancelled
  status?: string;
};
