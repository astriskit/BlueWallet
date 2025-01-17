import { mainClient, mainConnected, wasConnectedAtLeastOnce } from './client';
import { isDisabled } from './isDisabled';
import { presentNetworkErrorAlert } from './connectMain';

/**
 * Simple waiter till `mainConnected` becomes true (which means
 * it Electrum was connected in other function), or timeout 30 sec.
 */
export const waitTillConnected = async function (): Promise<boolean> {
  let waitTillConnectedInterval: NodeJS.Timeout | undefined;
  let retriesCounter = 0;
  if (await isDisabled()) {
    console.warn('Electrum connections disabled by user. waitTillConnected skipping...');
    return false;
  }
  return new Promise(function (resolve, reject) {
    waitTillConnectedInterval = setInterval(() => {
      if (mainConnected()) {
        clearInterval(waitTillConnectedInterval);
        return resolve(true);
      }

      if (wasConnectedAtLeastOnce() && mainClient()?.status === 1) {
        clearInterval(waitTillConnectedInterval);
        mainConnected(true);
        return resolve(true);
      }

      if (wasConnectedAtLeastOnce() && retriesCounter++ >= 150) {
        // `wasConnectedAtLeastOnce` needed otherwise theres gona be a race condition with the code that connects
        // electrum during app startup
        clearInterval(waitTillConnectedInterval);
        presentNetworkErrorAlert();
        reject(new Error('Waiting for Electrum connection timeout'));
      }
    }, 100);
  });
};
