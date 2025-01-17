import { mainClient } from './client';

export const serverFeatures = async function () {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  return mainClient().server_features();
};
