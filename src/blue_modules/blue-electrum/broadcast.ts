import { mainClient } from './client';

export const broadcast = async function (hex: string) {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  try {
    const res = await mainClient().blockchainTransaction_broadcast(hex);
    return res;
  } catch (error) {
    return error;
  }
};
