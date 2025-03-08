export const CryptoUnit = {
  BTC: 'BTC',
  SATS: 'sats',
  LOCAL_CURRENCY: 'local_currency',
  MAX: 'MAX',
  ETH: 'ETH',
  GWEI: 'gwei',
  WEI: 'wei',
} as const;
export type CryptoUnit = (typeof CryptoUnit)[keyof typeof CryptoUnit];

export const Chain = {
  ONCHAIN: 'ONCHAIN',
  OFFCHAIN: 'OFFCHAIN',
} as const;
export type Chain = (typeof Chain)[keyof typeof Chain];
