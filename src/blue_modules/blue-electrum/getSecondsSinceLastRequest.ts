import { mainClient } from './client';

export const getSecondsSinceLastRequest = function () {
  return mainClient() && mainClient().timeLastCall ? (+new Date() - mainClient().timeLastCall) / 1000 : -1;
};
