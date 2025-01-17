import { calcEstimateFeeFromFeeHistorgam } from './calcEstimateFeeFromFeeHistorgam';
import { mainClient } from './client';
import { estimateFee } from './estimateFee';

export const estimateFees = async function (): Promise<{ fast: number; medium: number; slow: number }> {
  let histogram;
  let timeoutId;
  try {
    histogram = await Promise.race([
      mainClient().mempool_getFeeHistogram(),
      new Promise(resolve => (timeoutId = setTimeout(resolve, 15000))),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }

  // fetching what electrum (which uses bitcoin core) thinks about fees:
  const _fast = await estimateFee(1);
  const _medium = await estimateFee(18);
  const _slow = await estimateFee(144);

  /**
   * sanity check, see
   * @see https://github.com/cculianu/Fulcrum/issues/197
   * (fallback to bitcoin core estimates)
   */
  if (!histogram || histogram?.[0]?.[0] > 1000) return { fast: _fast, medium: _medium, slow: _slow };

  // calculating fast fees from mempool:
  const fast = Math.max(2, calcEstimateFeeFromFeeHistorgam(1, histogram));
  // recalculating medium and slow fees using bitcoincore estimations only like relative weights:
  // (minimum 1 sat, just for any case)
  const medium = Math.max(1, Math.round((fast * _medium) / _fast));
  const slow = Math.max(1, Math.round((fast * _slow) / _fast));
  return { fast, medium, slow };
};
