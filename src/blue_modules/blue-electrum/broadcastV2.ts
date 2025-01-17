import { mainClient } from './client';

export const broadcastV2 = async function (hex: string): Promise<string> {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  return mainClient().blockchainTransaction_broadcast(hex);
};
