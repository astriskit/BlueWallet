import * as bitcoin from 'bitcoinjs-lib';

/**
 * Converts script pub key to a Taproot address if it can. Returns FALSE if it cant.
 *
 * @param scriptPubKey
 * @returns {boolean|string} Either bech32 address or false
 */
export function scriptPubKeyToAddress(scriptPubKey: string): string | false {
  try {
    const publicKey = Buffer.from(scriptPubKey, 'hex');
    return bitcoin.address.fromOutputScript(publicKey, bitcoin.networks.bitcoin);
  } catch (_) {
    return false;
  }
}
