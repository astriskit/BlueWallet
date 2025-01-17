import { percentile } from './percentile';

/**
 * The histogram is an array of [fee, vsize] pairs, where vsizen is the cumulative virtual size of mempool transactions
 * with a fee rate in the interval [feen-1, feen], and feen-1 > feen.
 */
export const calcEstimateFeeFromFeeHistorgam = function (numberOfBlocks: number, feeHistorgram: number[][]) {
  // first, transforming histogram:
  let totalVsize = 0;
  const histogramToUse = [];
  for (const h of feeHistorgram) {
    let [fee, vsize] = h;
    let timeToStop = false;

    if (totalVsize + vsize >= 1000000 * numberOfBlocks) {
      vsize = 1000000 * numberOfBlocks - totalVsize; // only the difference between current summarized sige to tip of the block
      timeToStop = true;
    }

    histogramToUse.push({ fee, vsize });
    totalVsize += vsize;
    if (timeToStop) break;
  }

  // now we have histogram of precisely size for numberOfBlocks.
  // lets spread it into flat array so its easier to calculate percentile:
  let histogramFlat: number[] = [];
  for (const hh of histogramToUse) {
    histogramFlat = histogramFlat.concat(Array(Math.round(hh.vsize / 25000)).fill(hh.fee));
    // division is needed so resulting flat array is not too huge
  }

  histogramFlat = histogramFlat.sort(function (a, b) {
    return a - b;
  });

  return Math.round(percentile(histogramFlat, 0.5) || 1);
};
