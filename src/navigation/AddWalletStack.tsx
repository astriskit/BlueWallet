import React from 'react';
import { Stack } from 'expo-router';

import navigationStyle, { CloseButtonPosition } from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';

export type AddWalletStackParamList = {
  AddWallet: {
    entropy?: string;
    words?: number;
  };
  ImportWallet?: {
    label?: string;
    triggerImport?: boolean;
    scannedData?: string;
    onBarScanned?: any;
  };
  ImportWalletDiscovery: {
    importText: string;
    askPassphrase: boolean;
    searchAccounts: boolean;
  };
  ImportSpeed: undefined;
  ImportCustomDerivationPath: {
    importText: string;
    password: string | undefined;
  };
  PleaseBackup: {
    walletID: string;
  };
  PleaseBackupLNDHub: {
    walletID: string;
  };
  ProvideEntropy: {
    words: number;
    entropy?: string;
  };
  WalletsAddMultisig: {
    walletLabel: string;
  };
  WalletsAddMultisigStep2: {
    m: number;
    n: number;
    walletLabel: string;
    format: string;
  };
  WalletsAddMultisigHelp: undefined;
};

const AddWalletStack = () => {
  const theme = useTheme();
  return (
    <Stack initialRouteName="AddWallet">
      <Stack.Screen name="index" />
      <Stack.Screen
        name="AddWallet"
        options={navigationStyle({
          closeButtonPosition: CloseButtonPosition.Left,
          title: loc.wallets.add_title,
        })(theme)}
      />
      <Stack.Screen
        name="ImportCustomDerivationPath"
        options={navigationStyle({
          // statusBarStyle: 'light', // buggy
          title: loc.wallets.import_derivation_title,
        })(theme)}
      />
      <Stack.Screen name="ImportWallet" options={navigationStyle({ title: loc.wallets.import_title })(theme)} />
      <Stack.Screen
        name="ImportSpeed"
        options={navigationStyle({
          // statusBarStyle: 'light',
          title: loc.wallets.import_title,
        })(theme)}
      />
      <Stack.Screen
        name="ImportWalletDiscovery"
        options={navigationStyle({
          title: loc.wallets.import_discovery_title,
        })(theme)}
      />
      <Stack.Screen
        name="PleaseBackup"
        options={navigationStyle({
          gestureEnabled: false,
          headerBackVisible: false,
          title: loc.pleasebackup.title,
        })(theme)}
      />
      <Stack.Screen
        name="PleaseBackupLNDHub"
        options={navigationStyle({
          gestureEnabled: false,
          headerBackVisible: false,
          title: loc.pleasebackup.title,
        })(theme)}
      />
      <Stack.Screen name="ProvideEntropy" options={navigationStyle({ title: loc.entropy.title })(theme)} />
      <Stack.Screen
        name="WalletsAddMultisig"
        options={navigationStyle({ title: '' })(theme)}
        initialParams={{ walletLabel: loc.multisig.default_label }}
      />
      <Stack.Screen name="WalletsAddMultisigStep2" options={navigationStyle({ title: '', gestureEnabled: false })(theme)} />
      <Stack.Screen
        name="WalletsAddMultisigHelp"
        options={navigationStyle({
          title: '',
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: '#0070FF',
          },
          headerTintColor: '#FFFFFF',
          // headerBackTitleVisible: false, // TODO: refactor-type
          // statusBarStyle: 'light',
          headerShadowVisible: false,
        })(theme)}
      />
      <Stack.Screen
        name="ScanQRCode"
        options={navigationStyle({
          headerShown: false,
          statusBarHidden: true,
          presentation: 'fullScreenModal',
          headerShadowVisible: false,
        })(theme)}
      />
    </Stack>
  );
};

export default AddWalletStack;
