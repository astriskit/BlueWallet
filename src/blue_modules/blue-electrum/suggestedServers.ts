import { Peer } from './types';

export const hardcodedPeers: Peer[] = [
  { host: 'mainnet.foundationdevices.com', ssl: 50002 },
  // { host: 'bitcoin.lukechilds.co', ssl: 50002 },
  // { host: 'electrum.jochen-hoenicke.de', ssl: '50006' },
  { host: 'electrum1.bluewallet.io', ssl: 443 },
  { host: 'electrum.acinq.co', ssl: 50002 },
  { host: 'electrum.bitaroo.net', ssl: 50002 },
];

export const suggestedServers: Peer[] = hardcodedPeers.map(peer => ({
  ...peer,
}));
