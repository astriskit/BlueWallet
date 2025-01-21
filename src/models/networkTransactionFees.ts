import { estimateFees } from '../blue_modules/blue-electrum/estimateFees';
import { isDisabled as isItDisabled } from '../blue_modules/blue-electrum/isDisabled';

export enum NetworkTransactionFeeType {
  FAST = 'Fast',
  MEDIUM = 'MEDIUM',
  SLOW = 'SLOW',
  CUSTOM = 'CUSTOM',
}

export class NetworkTransactionFee {
  static StorageKey = 'NetworkTransactionFee';

  public fastestFee: number;
  public mediumFee: number;
  public slowFee: number;

  constructor(fastestFee = 2, mediumFee = 1, slowFee = 1) {
    this.fastestFee = fastestFee;
    this.mediumFee = mediumFee;
    this.slowFee = slowFee;
  }
}

export default class NetworkTransactionFees {
  static async recommendedFees(): Promise<NetworkTransactionFee> {
    try {
      const isDisabled = await isItDisabled();
      if (isDisabled) {
        throw new Error('Electrum is disabled. Dont attempt to fetch fees');
      }
      const response = await estimateFees();
      return new NetworkTransactionFee(response.fast + 5, response.medium + 2, response.slow);
    } catch (err) {
      console.warn(err);
      return new NetworkTransactionFee(2, 1, 1);
    }
  }
}
