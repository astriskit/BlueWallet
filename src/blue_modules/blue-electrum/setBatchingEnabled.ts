import { disableBatching } from './client';

export const setBatchingEnabled = () => {
  disableBatching(false);
};
