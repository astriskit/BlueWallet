/** TODO: later menu-elements */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { router } from '../NavigationService';
import { useStorage } from './context/useStorage';

/*
Hook for managing iPadOS and macOS menu actions with keyboard shortcuts.
Uses MenuElementsEmitter for event handling.
*/

const { MenuElementsEmitter } = NativeModules;
const eventEmitter =
  (Platform.OS === 'ios' || Platform.OS === 'macos') && MenuElementsEmitter ? new NativeEventEmitter(MenuElementsEmitter) : null;

const useMenuElements = () => {
  const { walletsInitialized } = useStorage();
  const reloadTransactionsMenuActionRef = useRef<() => void>(() => {});

  const setReloadTransactionsMenuActionFunction = useCallback((newFunction: () => void) => {
    console.debug('Setting reloadTransactionsMenuActionFunction.');
    reloadTransactionsMenuActionRef.current = newFunction;
  }, []);

  const eventActions = useMemo(
    () => ({
      openSettings: () => router.navigate({ pathname: '/Settings' }),
      addWallet: () => router.navigate({ pathname: '/AddWalletRoot' }),
      importWallet: () => router.navigate({ pathname: '/AddWalletRoot/ImportWallet' }),
      reloadTransactions: () => {
        console.debug('Calling reloadTransactionsMenuActionFunction');
        reloadTransactionsMenuActionRef.current?.();
      },
    }),
    [],
  );

  useEffect(() => {
    if (!walletsInitialized || !eventEmitter) return;

    console.debug('Setting up menu event listeners');

    // Add permanent listeners only once
    eventEmitter.removeAllListeners('openSettings');
    eventEmitter.removeAllListeners('addWalletMenuAction');
    eventEmitter.removeAllListeners('importWalletMenuAction');

    eventEmitter.addListener('openSettings', eventActions.openSettings);
    eventEmitter.addListener('addWalletMenuAction', eventActions.addWallet);
    eventEmitter.addListener('importWalletMenuAction', eventActions.importWallet);

    const reloadTransactionsListener = eventEmitter.addListener('reloadTransactionsMenuAction', eventActions.reloadTransactions);

    return () => {
      console.debug('Removing reloadTransactionsMenuAction listener');
      reloadTransactionsListener.remove();
    };
  }, [walletsInitialized, eventActions]);

  return {
    setReloadTransactionsMenuActionFunction,
  };
};

export default useMenuElements;
