import * as bitcoin from 'bitcoinjs-lib';

/**
 * Converts script pub key to bech32 address if it can. Returns FALSE if it cant.
 *
 * @param scriptPubKey
 * @returns {boolean|string} Either bech32 address or false
 */
export function scriptPubKeyToAddress(scriptPubKey: string): string | false {
  try {
    const scriptPubKey2 = Buffer.from(scriptPubKey, 'hex');
    return (
      bitcoin.payments.p2wpkh({
        output: scriptPubKey2,
        network: bitcoin.networks.bitcoin,
      }).address ?? false
    );
  } catch (_) {
    return false;
  }
}
