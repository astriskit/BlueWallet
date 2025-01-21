import { useEffect, useRef } from 'react';
import DefaultPreference from 'react-native-default-preference';
import { Transaction } from '../class/wallets/types/Transaction';
import { TWallet } from '../class/wallets/types/TWallet';
import { useSettings } from '../hooks/context/useSettings';
import { useStorage } from '../hooks/context/useStorage';
import { GROUP_IO_BLUEWALLET } from '../blue_modules/currency';
import debounce from '../blue_modules/debounce';
import { WidgetCommunicationKeys } from './utils/WidgetCommunicationKeys.ios';
import { isBalanceDisplayAllowed } from './utils/isBalanceDisplayAllowed';

DefaultPreference.setName(GROUP_IO_BLUEWALLET);

export const calculateBalanceAndTransactionTime = async (
  wallets: TWallet[],
  walletsInitialized: boolean,
): Promise<{
  allWalletsBalance: number;
  latestTransactionTime: number | string;
}> => {
  if (!walletsInitialized || !(await isBalanceDisplayAllowed())) {
    return { allWalletsBalance: 0, latestTransactionTime: 0 };
  }

  const results = await Promise.allSettled(
    wallets.map(async wallet => {
      if (wallet.hideBalance) return { balance: 0, latestTransactionTime: 0 };

      const balance = await wallet.getBalance();
      const transactions: Transaction[] = await wallet.getTransactions();
      const confirmedTransactions = transactions.filter(t => t.confirmations > 0);
      const latestTransactionTime =
        confirmedTransactions.length > 0
          ? Math.max(...confirmedTransactions.map(t => t.received || t.time || 0))
          : WidgetCommunicationKeys.LatestTransactionIsUnconfirmed;

      return { balance, latestTransactionTime };
    }),
  );

  const allWalletsBalance = results.reduce((acc, result) => acc + (result.status === 'fulfilled' ? result.value.balance : 0), 0);
  const latestTransactionTime = results.reduce(
    (max, result) =>
      result.status === 'fulfilled' && typeof result.value.latestTransactionTime === 'number' && result.value.latestTransactionTime > max
        ? result.value.latestTransactionTime
        : max,
    0,
  );

  return { allWalletsBalance, latestTransactionTime };
};

export const syncWidgetBalanceWithWallets = async (
  wallets: TWallet[],
  walletsInitialized: boolean,
  cachedBalance: { current: number },
  cachedLatestTransactionTime: { current: number | string },
): Promise<void> => {
  try {
    const { allWalletsBalance, latestTransactionTime } = await calculateBalanceAndTransactionTime(wallets, walletsInitialized);

    if (cachedBalance.current !== allWalletsBalance || cachedLatestTransactionTime.current !== latestTransactionTime) {
      await Promise.all([
        DefaultPreference.set(WidgetCommunicationKeys.AllWalletsSatoshiBalance, String(allWalletsBalance)),
        DefaultPreference.set(WidgetCommunicationKeys.AllWalletsLatestTransactionTime, String(latestTransactionTime)),
      ]);

      cachedBalance.current = allWalletsBalance;
      cachedLatestTransactionTime.current = latestTransactionTime;
    }
  } catch (error) {
    console.error('Failed to sync widget balance with wallets:', error);
  }
};

const debouncedSyncWidgetBalanceWithWallets = debounce(
  async (
    wallets: TWallet[],
    walletsInitialized: boolean,
    cachedBalance: { current: number },
    cachedLatestTransactionTime: { current: number | string },
  ) => {
    await syncWidgetBalanceWithWallets(wallets, walletsInitialized, cachedBalance, cachedLatestTransactionTime);
  },
  500,
);

const useWidgetCommunication = (): void => {
  const { wallets, walletsInitialized } = useStorage();
  const { isWidgetBalanceDisplayAllowed } = useSettings();
  const cachedBalance = useRef<number>(0);
  const cachedLatestTransactionTime = useRef<number | string>(0);

  useEffect(() => {
    if (walletsInitialized) {
      debouncedSyncWidgetBalanceWithWallets(wallets, walletsInitialized, cachedBalance, cachedLatestTransactionTime);
    }
  }, [wallets, walletsInitialized, isWidgetBalanceDisplayAllowed]);

  useEffect(() => {
    return () => {
      debouncedSyncWidgetBalanceWithWallets.cancel();
    };
  }, []);
};

export default useWidgetCommunication;
