import bitcoin from 'bitcoinjs-lib';
import { CoinSelectOutput, CoinSelectReturnInput } from 'coinselect';

export type CreateTransactionResult = {
  tx?: bitcoin.Transaction;
  inputs: CoinSelectReturnInput[];
  outputs: CoinSelectOutput[];
  fee: number;
  psbt: bitcoin.Psbt;
};
