export type TransactionInput = {
  txid: string;
  vout: number;
  scriptSig: { asm: string; hex: string };
  txinwitness: string[];
  sequence: number;
  addresses?: string[];
  address?: string;
  value?: number;
};
