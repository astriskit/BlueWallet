import BigNumber from 'bignumber.js';
import { mainClient } from './client';

/**
 * Returns the estimated transaction fee to be confirmed within a certain number of blocks
 *
 * @param numberOfBlocks {number} The number of blocks to target for confirmation
 * @returns {Promise<number>} Satoshis per byte
 */
export const estimateFee = async function (numberOfBlocks: number): Promise<number> {
  if (!mainClient()) throw new Error('Electrum client is not connected');
  numberOfBlocks = numberOfBlocks || 1;
  const coinUnitsPerKilobyte = await mainClient().blockchainEstimatefee(numberOfBlocks);
  if (coinUnitsPerKilobyte === -1) return 1;
  return Math.round(new BigNumber(coinUnitsPerKilobyte).dividedBy(1024).multipliedBy(100000000).toNumber());
};
