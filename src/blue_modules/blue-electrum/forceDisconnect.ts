import { mainClient } from './client';

export const forceDisconnect = (): void => {
  mainClient()?.close();
};
