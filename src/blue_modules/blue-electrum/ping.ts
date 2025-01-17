import { mainClient, mainConnected } from './client';

export const ping = async function () {
  try {
    await mainClient().server_ping();
  } catch (_) {
    mainConnected(false);
    return false;
  }
  return true;
};
