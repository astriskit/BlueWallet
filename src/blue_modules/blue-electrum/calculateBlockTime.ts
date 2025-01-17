import { latestBlock } from './client';

export const calculateBlockTime = function (height: number): number {
  if (latestBlock().height) {
    return Math.floor(latestBlock().time + (height - latestBlock().height) * 9.93 * 60);
  }

  const baseTs = 1585837504; // sec
  const baseHeight = 624083;
  return Math.floor(baseTs + (height - baseHeight) * 9.93 * 60);
};
