import { CreateTransactionUtxo } from '../class/wallets/types/CreateTransactionUtxo';
import { CryptoUnit } from '../models/cryptoUnits';

export type SendDetailsParams = {
  transactionMemo?: string;
  isTransactionReplaceable?: boolean;
  payjoinUrl?: string;
  feeUnit?: CryptoUnit;
  frozenBalance?: number;
  amountUnit?: CryptoUnit;
  address?: string;
  amount?: number;
  amountSats?: number;
  onBarScanned?: string;
  unit?: CryptoUnit;
  noRbf?: boolean;
  walletID: string;
  launchedBy?: string;
  utxos?: CreateTransactionUtxo[] | null;
  isEditable?: boolean;
  uri?: string;
  addRecipientParams?: {
    address: string;
    amount?: number;
    memo?: string;
  };
};
