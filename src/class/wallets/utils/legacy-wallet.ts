import * as bitcoin from 'bitcoinjs-lib';

/**
 * Converts script pub key to legacy address if it can. Returns FALSE if it cant.
 *
 * @param scriptPubKey
 * @returns {boolean|string} Either p2pkh address or false
 */
export function scriptPubKeyToAddress(scriptPubKey: string): string | false {
  try {
    const scriptPubKey2 = Buffer.from(scriptPubKey, 'hex');
    return (
      bitcoin.payments.p2pkh({
        output: scriptPubKey2,
        network: bitcoin.networks.bitcoin,
      }).address ?? false
    );
  } catch (_) {
    return false;
  }
}
