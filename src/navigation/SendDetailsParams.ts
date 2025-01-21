import { CreateTransactionUtxo } from '../class/wallets/types/CreateTransactionUtxo';
import { BitcoinUnit } from '../models/bitcoinUnits';

export type SendDetailsParams = {
  transactionMemo?: string;
  isTransactionReplaceable?: boolean;
  payjoinUrl?: string;
  feeUnit?: BitcoinUnit;
  frozenBalance?: number;
  amountUnit?: BitcoinUnit;
  address?: string;
  amount?: number;
  amountSats?: number;
  onBarScanned?: string;
  unit?: BitcoinUnit;
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
