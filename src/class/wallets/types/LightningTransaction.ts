export type LightningTransaction = {
  memo?: string;
  type?: 'user_invoice' | 'payment_request' | 'bitcoind_tx' | 'paid_invoice';
  payment_hash?: string | { data: string };
  category?: 'receive';
  timestamp?: number;
  expire_time?: number;
  ispaid?: boolean;
  walletID?: string;
  value?: number;
  amt?: number;
  fee?: number;
  payment_preimage?: string;
  payment_request?: string;
  description?: string;
};
