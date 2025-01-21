import { HDAezeedWallet } from '../hd-aezeed-wallet';
import { HDLegacyBreadwalletWallet } from '../hd-legacy-breadwallet-wallet';
import { HDLegacyElectrumSeedP2PKHWallet } from '../hd-legacy-electrum-seed-p2pkh-wallet';
import { HDSegwitElectrumSeedP2WPKHWallet } from '../hd-segwit-electrum-seed-p2wpkh-wallet';
import { LegacyWallet } from '../legacy-wallet';
import { LightningCustodianWallet } from '../lightning-custodian-wallet';
import { MultisigHDWallet } from '../multisig-hd-wallet';
import { SegwitBech32Wallet } from '../segwit-bech32-wallet';
import { SegwitP2SHWallet } from '../segwit-p2sh-wallet';
import { SLIP39LegacyP2PKHWallet, SLIP39SegwitBech32Wallet, SLIP39SegwitP2SHWallet } from '../slip39-wallets';
import { WatchOnlyWallet } from '../watch-only-wallet';
import { HDLegacyP2PKHWallet } from '../hd-legacy-p2pkh-wallet';
import { HDSegwitBech32Wallet } from '../hd-segwit-bech32-wallet';
import { HDSegwitP2SHWallet } from '../hd-segwit-p2sh-wallet';

export type TWallet =
  | HDAezeedWallet
  | HDLegacyBreadwalletWallet
  | HDLegacyElectrumSeedP2PKHWallet
  | HDLegacyP2PKHWallet
  | HDSegwitBech32Wallet
  | HDSegwitElectrumSeedP2WPKHWallet
  | HDSegwitP2SHWallet
  | LegacyWallet
  | LightningCustodianWallet
  | MultisigHDWallet
  | SLIP39LegacyP2PKHWallet
  | SLIP39SegwitBech32Wallet
  | SLIP39SegwitP2SHWallet
  | SegwitBech32Wallet
  | SegwitP2SHWallet
  | WatchOnlyWallet;
