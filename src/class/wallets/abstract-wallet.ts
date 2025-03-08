import createHash from 'create-hash';

import { CryptoUnit, Chain } from '../../models/cryptoUnits';
import { Transaction } from './types/Transaction';

type WalletWithPassphrase = AbstractWallet & { getPassphrase: () => string };

export class AbstractWallet {
  static readonly type: string = 'abstract';
  static readonly typeReadable: string = 'abstract';
  public readonly type = AbstractWallet.type;
  public readonly typeReadable = AbstractWallet.typeReadable;

  static fromJson(obj: string): AbstractWallet {
    const obj2 = JSON.parse(obj);
    const temp = new this();
    for (const key2 of Object.keys(obj2)) {
      if (key2 !== '_getTransactionTrait') {
        // @ts-ignore This kind of magic is not allowed in typescript, we should try and be more specific
        temp[key2] = obj2[key2];
      }
    }

    return temp;
  }

  label: string;
  secret: string;
  balance: number;
  unconfirmed_balance: number;
  _address: string | false;
  _lastTxFetch: number;
  _lastBalanceFetch: number;
  preferredBalanceUnit: CryptoUnit;
  chain: Chain;
  hideBalance: boolean;
  userHasSavedExport: boolean;
  _hideTransactionsInWalletsList: boolean;
  _derivationPath?: string;

  constructor() {
    this.label = '';
    this.secret = ''; // private key or recovery phrase
    this.balance = 0;
    this.unconfirmed_balance = 0;
    this._address = false; // cache
    this._lastTxFetch = 0;
    this._lastBalanceFetch = 0;
    this.preferredBalanceUnit = CryptoUnit.BTC;
    this.chain = Chain.ONCHAIN;
    this.hideBalance = false;
    this.userHasSavedExport = false;
    this._hideTransactionsInWalletsList = false;
  }

  /**
   * @returns {number} Timestamp (millisecsec) of when last transactions were fetched from the network
   */
  getLastTxFetch(): number {
    return this._lastTxFetch;
  }

  getID(): string {
    const thisWithPassphrase = this as unknown as WalletWithPassphrase;
    const passphrase = thisWithPassphrase.getPassphrase ? thisWithPassphrase.getPassphrase() : '';
    const path = this._derivationPath ?? '';
    const string2hash = this.type + this.getSecret() + passphrase + path;
    return createHash('sha256').update(string2hash).digest().toString('hex');
  }

  getTransactions(): Transaction[] {
    throw new Error('not implemented');
  }

  getUserHasSavedExport(): boolean {
    return this.userHasSavedExport;
  }

  setUserHasSavedExport(value: boolean): void {
    this.userHasSavedExport = value;
  }

  getHideTransactionsInWalletsList(): boolean {
    return this._hideTransactionsInWalletsList;
  }

  setHideTransactionsInWalletsList(value: boolean): void {
    this._hideTransactionsInWalletsList = value;
  }

  /**
   * Simple function which says that we havent tried to fetch balance
   * for a long time
   *
   * @return {boolean}
   */
  timeToRefreshBalance(): boolean {
    if (+new Date() - this._lastBalanceFetch >= 5 * 60 * 1000) {
      return true;
    }
    return false;
  }

  /**
   * Simple function which says if we hve some low-confirmed transactions
   * and we better fetch them
   *
   * @return {boolean}
   */
  timeToRefreshTransaction(): boolean {
    for (const tx of this.getTransactions()) {
      if ((tx.confirmations ?? 0) < 7 && this._lastTxFetch < +new Date() - 5 * 60 * 1000) {
        return true;
      }
    }
    return false;
  }

  /**
   *
   * @returns {string}
   */
  getLabel(): string {
    if (this.label.trim().length === 0) {
      return 'Wallet';
    }
    return this.label;
  }

  getXpub(): string | false {
    return this._address;
  }

  /**
   *
   * @returns {number} Available to spend amount, int, in sats
   */
  getBalance(): number {
    return this.balance + (this.getUnconfirmedBalance() < 0 ? this.getUnconfirmedBalance() : 0);
  }

  getPreferredBalanceUnit(): CryptoUnit {
    for (const value of Object.values(CryptoUnit)) {
      if (value === this.preferredBalanceUnit) {
        return this.preferredBalanceUnit;
      }
    }
    return CryptoUnit.BTC;
  }

  async allowOnchainAddress(): Promise<boolean> {
    throw new Error('allowOnchainAddress: Not implemented');
  }

  allowBIP47(): boolean {
    return false;
  }

  switchBIP47(value: boolean): void {
    throw new Error('switchBIP47: not implemented');
  }

  allowReceive(): boolean {
    return true;
  }

  allowSend(): boolean {
    return true;
  }

  allowSilentPaymentSend(): boolean {
    return false;
  }

  weOwnAddress(address: string): boolean {
    throw Error('not implemented');
  }

  weOwnTransaction(txid: string): boolean {
    throw Error('not implemented');
  }

  /**
   * Returns delta of unconfirmed balance. For example, if theres no
   * unconfirmed balance its 0
   *
   * @return {number} Satoshis
   */
  getUnconfirmedBalance(): number {
    return this.unconfirmed_balance;
  }

  setLabel(newLabel: string): this {
    this.label = newLabel;
    return this;
  }

  getSecret(): string {
    return this.secret;
  }

  setSecret(newSecret: string): this {
    this.secret = newSecret.trim();
    return this;
  }

  getLatestTransactionTime(): string | 0 {
    return 0;
  }

  getLatestTransactionTimeEpoch(): number {
    if (this.getTransactions().length === 0) {
      return 0;
    }
    let max = 0;
    for (const tx of this.getTransactions()) {
      max = Math.max(new Date(tx.received ?? 0).getTime(), max);
    }
    return max;
  }

  /**
   * @deprecated
   * TODO: be more precise on the type
   */
  createTx(): any {
    throw Error('not implemented');
  }

  getAddress(): string | false | undefined {
    throw Error('not implemented');
  }

  getAddressAsync(): Promise<string | false | undefined> {
    return new Promise(resolve => resolve(this.getAddress()));
  }

  async getChangeAddressAsync(): Promise<string | false | undefined> {
    return new Promise(resolve => resolve(this.getAddress()));
  }

  useWithHardwareWalletEnabled(): boolean {
    return false;
  }

  isBIP47Enabled(): boolean {
    return false;
  }

  async wasEverUsed(): Promise<boolean> {
    throw new Error('Not implemented');
  }

  /**
   * Returns _all_ external addresses in hierarchy (for HD wallets) or just address for single-address wallets
   * _Not_ internal ones, as this method is supposed to be used for subscription of external notifications.
   *
   * @returns string[] Addresses
   */
  getAllExternalAddresses(): string[] {
    return [];
  }

  prepareForSerialization(): void {}
}
