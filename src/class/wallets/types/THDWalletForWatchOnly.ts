import { HDLegacyP2PKHWallet } from '../hd-legacy-p2pkh-wallet';
import { HDSegwitBech32Wallet } from '../hd-segwit-bech32-wallet';
import { HDSegwitP2SHWallet } from '../hd-segwit-p2sh-wallet';

export type THDWalletForWatchOnly = HDSegwitBech32Wallet | HDSegwitP2SHWallet | HDLegacyP2PKHWallet;
