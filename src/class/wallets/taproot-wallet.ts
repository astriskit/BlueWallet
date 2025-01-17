import { SegwitBech32Wallet } from './segwit-bech32-wallet';

export class TaprootWallet extends SegwitBech32Wallet {
  static readonly type = 'taproot';
  static readonly typeReadable = 'P2 TR';
  // @ts-ignore: override
  public readonly type = TaprootWallet.type;
  // @ts-ignore: override
  public readonly typeReadable = TaprootWallet.typeReadable;
  public readonly segwitType = 'p2wpkh';
}
