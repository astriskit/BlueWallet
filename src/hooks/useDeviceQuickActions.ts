import { useEffect } from 'react';
import { DeviceEventEmitter, Linking, Platform } from 'react-native';
import QuickActions, { ShortcutItem } from 'react-native-quick-actions';
import DeeplinkSchemaMatch from '../class/deeplink-schema-match';
import { TWallet } from '../class/wallets/types';
import useOnAppLaunch from '../hooks/useOnAppLaunch';
import { formatBalance } from '../loc';
import { router, RouterParam } from '../NavigationService';
import { useSettings } from '../hooks/context/useSettings';
import { useStorage } from '../hooks/context/useStorage';
import { getEnabled } from './utils/device-quick-actions';

const useDeviceQuickActions = () => {
  const { wallets, walletsInitialized, isStorageEncrypted, addWallet, saveToDisk, setSharedCosigner } = useStorage();
  const { preferredFiatCurrency, isQuickActionsEnabled } = useSettings();
  const { isViewAllWalletsEnabled, getSelectedDefaultWallet } = useOnAppLaunch();

  useEffect(() => {
    if (walletsInitialized) {
      isStorageEncrypted()
        .then(value => {
          if (value) {
            removeShortcuts();
          } else {
            setQuickActions();
          }
        })
        .catch(() => removeShortcuts());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, walletsInitialized, preferredFiatCurrency, isStorageEncrypted]);

  useEffect(() => {
    if (walletsInitialized) {
      DeviceEventEmitter.addListener('quickActionShortcut', walletQuickActions);
      popInitialShortcutAction().then(popInitialAction);
      return () => DeviceEventEmitter.removeAllListeners('quickActionShortcut');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletsInitialized]);

  useEffect(() => {
    if (walletsInitialized) {
      if (isQuickActionsEnabled) {
        setQuickActions();
      } else {
        removeShortcuts();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuickActionsEnabled, walletsInitialized]);

  const popInitialShortcutAction = async (): Promise<any> => {
    const data = await QuickActions.popInitialAction();
    return data;
  };

  const popInitialAction = async (data: any): Promise<void> => {
    if (data) {
      const wallet = wallets.find(w => w.getID() === data.userInfo.url.split('wallet/')[1]);
      if (wallet) {
        router.navigate({
          pathname: '/WalletTransactions',
          params: {
            walletID: wallet.getID(),
            walletType: wallet.type,
          },
        });
      }
    } else {
      const url = await Linking.getInitialURL();
      if (url) {
        if (DeeplinkSchemaMatch.hasSchema(url)) {
          handleOpenURL({ url });
        }
      } else {
        if (!(await isViewAllWalletsEnabled())) {
          const selectedDefaultWalletID = (await getSelectedDefaultWallet()) as string;
          const selectedDefaultWallet = wallets.find((w: TWallet) => w.getID() === selectedDefaultWalletID);
          if (selectedDefaultWallet) {
            router.navigate({
              pathname: '/WalletTransactions',
              params: {
                walletID: selectedDefaultWalletID,
                walletType: selectedDefaultWallet.type,
              },
            });
          }
        }
      }
    }
  };

  const handleOpenURL = (event: { url: string }): void => {
    DeeplinkSchemaMatch.navigationRouteFor(event, value => router.navigate(value as RouterParam), {
      wallets,
      addWallet,
      saveToDisk,
      setSharedCosigner,
    });
  };

  const walletQuickActions = (data: any): void => {
    const wallet = wallets.find(w => w.getID() === data.userInfo.url.split('wallet/')[1]);
    if (wallet) {
      router.navigate({
        pathname: '/WalletTransactions',
        params: {
          walletID: wallet.getID(),
          walletType: wallet.type,
        },
      });
    }
  };

  const removeShortcuts = async (): Promise<void> => {
    if (Platform.OS === 'android') {
      QuickActions.clearShortcutItems();
    } else {
      // @ts-ignore: Fix later
      QuickActions.setShortcutItems([{ type: 'EmptyWallets', title: '' }]);
    }
  };

  const setQuickActions = async (): Promise<void> => {
    if (await getEnabled()) {
      QuickActions.isSupported((error: null, _supported: any) => {
        if (error === null) {
          const shortcutItems: ShortcutItem[] = wallets.slice(0, 4).map((wallet, index) => ({
            type: 'Wallets',
            title: wallet.getLabel(),
            subtitle:
              wallet.hideBalance || wallet.getBalance() <= 0
                ? ''
                : formatBalance(Number(wallet.getBalance()), wallet.getPreferredBalanceUnit(), true),
            userInfo: {
              url: `bluewallet://wallet/${wallet.getID()}`,
            },
            icon:
              Platform.select({
                android: 'quickactions',
                ios: index === 0 ? 'Favorite' : 'Bookmark',
              }) || 'quickactions',
          }));
          QuickActions.setShortcutItems(shortcutItems);
        }
      });
    } else {
      removeShortcuts();
    }
  };

  return { popInitialAction };
};

export default useDeviceQuickActions;
