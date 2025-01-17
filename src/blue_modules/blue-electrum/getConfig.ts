import { mainClient, serverName } from './client';

export const getConfig = async function () {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  return {
    host: mainClient().host,
    port: mainClient().port,
    serverName: serverName(),
    connected: mainClient().timeLastCall !== 0 && mainClient().status,
  };
};
