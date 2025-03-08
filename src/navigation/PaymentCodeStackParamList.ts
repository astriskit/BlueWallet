import { CryptoUnit } from '../models/cryptoUnits';

export type PaymentCodeStackParamList = {
  PaymentCode: { paymentCode: string };
  PaymentCodesList: {
    memo: string;
    address: string;
    walletID: string;
    amount: number;
    amountSats: number;
    unit: CryptoUnit;
    isTransactionReplaceable: boolean;
    launchedBy: string;
    isEditable: boolean;
    uri: string /* payjoin uri */;
  };
};
