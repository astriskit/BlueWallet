import '@/shim.js';

import set from 'lodash.set';
import get from 'lodash.get';

import type { Client } from './types';

import { hardcodedPeers } from './suggestedServers';

const client: Client = {
  mainClient: undefined,
  realm: undefined,
  mainConnected: false,
  connectionAttempt: 0,
  wasConnectedAtLeastOnce: false,
  serverName: false,
  disableBatching: false,
  latestBlock: {
    height: undefined,
    time: undefined,
  },
  currentPeerIndex: Math.floor(Math.random() * hardcodedPeers.length),
};

const getOrSet =
  <V>(key: keyof Client) =>
  (value: V | undefined = undefined) => {
    if (!value) return get(client, key);
    set(client, key, value);
  };

export const mainClient = getOrSet<typeof client.mainClient>('mainClient');
export const realm = getOrSet<typeof client.realm>('realm');
export const mainConnected = getOrSet<typeof client.mainConnected>('mainConnected');
export const connectionAttempt = getOrSet<typeof client.connectionAttempt>('connectionAttempt');
export const wasConnectedAtLeastOnce = getOrSet<typeof client.wasConnectedAtLeastOnce>('wasConnectedAtLeastOnce');
export const serverName = getOrSet<typeof client.serverName>('serverName');
export const disableBatching = getOrSet<typeof client.disableBatching>('disableBatching');
export const latestBlock = getOrSet<typeof client.latestBlock>('latestBlock');
export const currentPeerIndex = getOrSet<typeof client.currentPeerIndex>('currentPeerIndex');
