/* eslint-disable camelcase */
import b58 from 'bs58check';
import BigNumber from 'bignumber.js';
import BIP32Factory, { BIP32Interface } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';

import BIP47Factory, { BIP47Interface } from '@spsina/bip47';
import ecc from '@/src/blue_modules/noble_ecc';
import { multiGetHistoryByAddress } from '@/src/blue_modules/blue-electrum/multiGetHistoryByAddress';
import { multiGetTransactionByTxid } from '@/src/blue_modules/blue-electrum/multiGetTransactionByTxid';

import { Transaction } from '../types/Transaction';

const bip32 = BIP32Factory(ecc);
const bip47 = BIP47Factory(ecc);

type BalanceByIndex = {
  c: number;
  u: number;
};

/**
 * Extracted the trait of getTransactions from AbstractHDElectrumWallet.
 */
export class GetTransactions {
  public readonly segwitType = 'p2wpkh';
  static readonly derivationPath: string = "m/84'/0'/0'";

  _txs_by_external_index: Record<number, Transaction[]> = [];
  _txs_by_internal_index: Record<number, Transaction[]> = [];
  _receive_payment_codes: string[] = [];
  _txs_by_payment_code_index: Record<string, Transaction[][]> = {};
  internal_addresses_cache: Record<number, string> = {};
  external_addresses_cache: Record<number, string> = {};
  _node0?: BIP32Interface;
  _node1?: BIP32Interface;
  _bip47_instance?: BIP47Interface;
  _address_to_wif_cache: Record<string, string> = {};
  passphrase?: string;
  _balances_by_payment_code_index: Record<string, BalanceByIndex> = {};
  _address: string | false = false;
  secret: string = '';

  /**
   * receive index
   */
  _next_free_payment_code_address_index_receive: Record<string, number> = {};

  /**
   * joint addresses with remote counterparties, to receive funds
   */
  _addresses_by_payment_code_receive: Record<string, string[]> = {};

  /**
   * payment codes of people whom we can pay
   */
  _send_payment_codes: string[] = [];

  /**
   * joint addresses with remote counterparties, whom we can send funds
   */
  _addresses_by_payment_code_send: Record<string, string[]> = {};

  /**
   * Creates Segwit Bech32 Bitcoin address
   */
  _nodeToBech32SegwitAddress(hdNode: BIP32Interface): string {
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: hdNode.publicKey,
    });

    if (!address) {
      throw new Error('Could not create address in _nodeToBech32SegwitAddress');
    }

    return address;
  }

  _hdNodeToAddress(hdNode: BIP32Interface): string {
    return this._nodeToBech32SegwitAddress(hdNode);
  }

  /*
   * Converts zpub to xpub
   *
   * @param {String} zpub
   * @returns {String} xpub
   */
  _zpubToXpub(zpub: string): string {
    let data = b58.decode(zpub);
    data = data.slice(4);
    data = Buffer.concat([Buffer.from('0488b21e', 'hex'), data]);

    return b58.encode(data);
  }

  getXpub(): string | false {
    return this._address;
  }

  _getNodeAddressByIndex(node: number, index: number): string {
    index = index * 1; // cast to int
    if (node === 0) {
      if (this.external_addresses_cache[index]) return this.external_addresses_cache[index]; // cache hit
    }

    if (node === 1) {
      if (this.internal_addresses_cache[index]) return this.internal_addresses_cache[index]; // cache hit
    }

    const pub = this.getXpub();
    if (pub && node === 0 && !this._node0) {
      if (pub) {
        const xpub = this._zpubToXpub(pub);
        const hdNode = bip32.fromBase58(xpub);
        this._node0 = hdNode.derive(node);
      }
    }

    if (pub && node === 1 && !this._node1) {
      const xpub = this._zpubToXpub(pub);
      const hdNode = bip32.fromBase58(xpub);
      this._node1 = hdNode.derive(node);
    }

    let address: string;
    if (node === 0) {
      if (!this?._node0?.derive) throw new Error('_node0.derive is undefined');
      address = this._hdNodeToAddress(this?._node0.derive(index));
    } else {
      if (!this?._node1?.derive) throw new Error('_node1.derive is undefined');
      // tbh the only possible else is node === 1
      address = this._hdNodeToAddress(this._node1.derive(index));
    }

    if (node === 0) {
      return (this.external_addresses_cache[index] = address);
    } else {
      // tbh the only possible else option is node === 1
      return (this.internal_addresses_cache[index] = address);
    }
  }

  _getExternalAddressByIndex(index: number): string {
    return this._getNodeAddressByIndex(0, index);
  }

  _getInternalAddressByIndex(index: number) {
    return this._getNodeAddressByIndex(1, index);
  }

  _getNextFreePaymentCodeIndexReceive(paymentCode: string) {
    return this._next_free_payment_code_address_index_receive[paymentCode] || 0;
  }

  getBIP47FromSeed(): BIP47Interface {
    if (!this._bip47_instance || !this._bip47_instance.getNotificationAddress) {
      this._bip47_instance = bip47.fromBip39Seed(this.secret, undefined, this.passphrase);
    }

    return this._bip47_instance;
  }

  /**
   * returns joint addresses to receive coins with a given counterparty
   */
  _getBIP47AddressReceive(paymentCode: string, index: number): string {
    if (!this._addresses_by_payment_code_receive[paymentCode]) this._addresses_by_payment_code_receive[paymentCode] = [];

    if (this._addresses_by_payment_code_receive[paymentCode][index]) {
      return this._addresses_by_payment_code_receive[paymentCode][index];
    }

    const bip47_instance = this.getBIP47FromSeed();
    const senderBIP47_instance = bip47.fromPaymentCode(paymentCode);
    const remotePaymentNode = senderBIP47_instance.getPaymentCodeNode();
    const hdNode = bip47_instance.getPaymentWallet(remotePaymentNode, index);
    const address = this._hdNodeToAddress(hdNode);
    this._address_to_wif_cache[address] = hdNode.toWIF();
    this._addresses_by_payment_code_receive[paymentCode][index] = address;
    return address;
  }

  /**
   * return BIP47 payment code of the counterparty of this transaction (someone who paid us, or someone we paid)
   * or undefined if it was a non-BIP47 transaction
   */
  getBip47CounterpartyByTx(tx: Transaction): string | undefined {
    for (const pc of Object.keys(this._txs_by_payment_code_index)) {
      // iterating all payment codes

      for (const txs of Object.values(this._txs_by_payment_code_index[pc])) {
        for (const tx2 of txs) {
          if (tx2.txid === tx.txid) {
            return pc; // found it!
          }
        }
      }
    }

    // checking txs we sent to counterparties

    for (const pc of this._send_payment_codes) {
      for (const out of tx.outputs) {
        for (const address of out.scriptPubKey?.addresses ?? []) {
          if (this._addresses_by_payment_code_send[pc] && Object.values(this._addresses_by_payment_code_send[pc]).includes(address)) {
            // found it!
            return pc;
          }
        }
      }
    }

    return undefined; // found nothing
  }

  getTransactions() {
    let txs: Transaction[] = [];

    for (const addressTxs of Object.values(this._txs_by_external_index)) {
      txs = txs.concat(addressTxs);
    }
    for (const addressTxs of Object.values(this._txs_by_internal_index)) {
      txs = txs.concat(addressTxs);
    }
    if (this._receive_payment_codes) {
      for (const pc of this._receive_payment_codes) {
        if (this._txs_by_payment_code_index[pc])
          for (const addressTxs of Object.values(this._txs_by_payment_code_index[pc])) {
            txs = txs.concat(addressTxs);
          }
      }
    }

    if (txs.length === 0) return []; // guard clause; so we wont spend time calculating addresses

    // its faster to pre-build hashmap of owned addresses than to query `this.weOwnAddress()`, which in turn
    // iterates over all addresses in hierarchy
    const ownedAddressesHashmap: Record<string, boolean> = {};

    // @ts-ignore "this" should be updated while consuming
    // if (!this?.next_free_address_index) throw new Error('next_free_address_index is not defined');
    // if (!this?._getExternalAddressByIndex) throw new Error('_getExternalAddressByIndex is not defined');

    // @ts-ignore "this" should be updated while consuming
    for (let c = 0; c < this?.next_free_address_index + 1; c++) {
      ownedAddressesHashmap[this._getExternalAddressByIndex(c) as string] = true;
    }

    // @ts-ignore "this" should be updated while consuming
    // if (!this?.next_free_change_address_index) throw new Error('next_free_change_address_index is not defined');
    // if (!this?._getInternalAddressByIndex) throw new Error('_getInternalAddressByIndex is not defined');

    // @ts-ignore "this" should be updated while consuming
    for (let c = 0; c < this.next_free_change_address_index + 1; c++) {
      ownedAddressesHashmap[this._getInternalAddressByIndex(c) as string] = true;
    }
    if (this._receive_payment_codes) {
      // if (!this?._getNextFreePaymentCodeIndexReceive) throw new Error('_getNextFreePaymentCodeIndexReceive is not defined');
      // if (!this?._getBIP47AddressReceive) throw new Error('_getBIP47AddressReceive is not defined');

      for (const pc of this._receive_payment_codes) {
        for (let c = 0; c < (this._getNextFreePaymentCodeIndexReceive(pc) as number) + 1; c++) {
          ownedAddressesHashmap[this._getBIP47AddressReceive(pc, c) as string] = true;
        }
      }
    }

    // @ts-ignore "this" should be updated while consuming
    // hack: in case this code is called from LegacyWallet:
    if (this?.getAddress?.()) ownedAddressesHashmap[String(this?.getAddress?.())] = true;

    const ret: Transaction[] = [];
    for (const tx of txs) {
      tx.received = tx.blocktime * 1000;
      if (!tx.blocktime) tx.received = +new Date() - 30 * 1000; // unconfirmed
      tx.confirmations = tx.confirmations || 0; // unconfirmed
      tx.hash = tx.txid;
      tx.value = 0;

      for (const vin of tx.inputs) {
        // if input (spending) goes from our address - we are loosing!
        if ((vin.address && ownedAddressesHashmap[vin.address]) || (vin.addresses?.[0] && ownedAddressesHashmap[vin.addresses[0]])) {
          tx.value -= new BigNumber(vin.value ?? 0).multipliedBy(100000000).toNumber();
        }
      }

      for (const vout of tx.outputs) {
        // when output goes to our address - this means we are gaining!
        if (vout.scriptPubKey.addresses?.[0] && ownedAddressesHashmap[vout.scriptPubKey.addresses[0]]) {
          tx.value += new BigNumber(vout.value).multipliedBy(100000000).toNumber();
        }
      }
      // @ts-ignore "this" should be updated while consuming
      if (this?.allowBIP47?.() && this.isBIP47Enabled()) {
        tx.counterparty = this.getBip47CounterpartyByTx(tx) as undefined | string;
      }
      ret.push(tx);
    }

    // now, deduplication:
    const usedTxIds: Record<string, number> = {};
    const ret2 = [];
    for (const tx of ret) {
      if (!usedTxIds[tx.txid]) ret2.push(tx);
      usedTxIds[tx.txid] = 1;
    }

    return ret2.sort(function (a, b) {
      return Number(b.received) - Number(a.received);
    });
  }

  /**
   * check our notification address, and decypher all payment codes people notified us
   * about (so they can pay us)
   */
  async fetchBIP47SenderPaymentCodes(): Promise<void> {
    const bip47_instance = this.getBIP47FromSeed();
    const address = bip47_instance.getNotificationAddress();
    const histories = await multiGetHistoryByAddress([address]);
    const txHashes = histories[address].map(({ tx_hash }) => tx_hash);

    const txHexs = await multiGetTransactionByTxid(txHashes, false);
    for (const txHex of Object.values(txHexs)) {
      try {
        const paymentCode = bip47_instance.getPaymentCodeFromRawNotificationTransaction(txHex);
        if (this._receive_payment_codes.includes(paymentCode)) continue; // already have it

        // final check if PC is even valid (could've been constructed by a buggy code, and our code would crash with that):
        try {
          bip47.fromPaymentCode(paymentCode);
        } catch (_) {
          continue;
        }

        this._receive_payment_codes.push(paymentCode);
        this._next_free_payment_code_address_index_receive[paymentCode] = 0; // initialize
        this._balances_by_payment_code_index[paymentCode] = { c: 0, u: 0 };
      } catch (e) {
        // do nothing
      }
    }
  }
}
