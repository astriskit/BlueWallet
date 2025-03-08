import { CryptoUnit } from '../../../models/cryptoUnits';

import { Transaction } from './Transaction';

/**
 * in some cases we add additional data to each tx object so the code that works with that transaction can find the
 * wallet that owns it etc
 */
export type ExtendedTransaction = Transaction & {
  walletID: string;
  walletPreferredBalanceUnit: CryptoUnit;
};
