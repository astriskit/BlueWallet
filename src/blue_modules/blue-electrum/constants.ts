export const txhashHeightCache: Record<string, number> = {};

export const ELECTRUM_HOST = 'electrum_host';
export const ELECTRUM_TCP_PORT = 'electrum_tcp_port';
export const ELECTRUM_SSL_PORT = 'electrum_ssl_port';
export const ELECTRUM_SERVER_HISTORY = 'electrum_server_history';

export const ELECTRUM_CONNECTION_DISABLED = 'electrum_disabled';
export const storageKey = 'ELECTRUM_PEERS';
export const defaultPeer = { host: 'electrum1.bluewallet.io', ssl: 443 };

// eslint-disable-next-line @typescript-eslint/no-require-imports
export const net = require('net');
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const tls = require('tls');
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const ElectrumClient = require('electrum-client');
