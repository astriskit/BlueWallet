import React from 'react';
import { Stack } from 'expo-router';

import navigationStyle from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';
// import { ScanQRCodeComponent } from './LazyLoadScanQRCodeStack';

const ScanLndInvoiceRoot = () => {
  const theme = useTheme();
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="ScanLndInvoice"
        options={navigationStyle({ headerBackVisible: false, title: loc.send.header, statusBarStyle: 'light' })(theme)}
        initialParams={{ uri: undefined, walletID: undefined, invoice: undefined }}
      />
      <Stack.Screen name="SelectWallet" options={navigationStyle({ title: loc.wallets.select_wallet })(theme)} />
      <Stack.Screen name="Success" options={navigationStyle({ headerShown: false, gestureEnabled: false })(theme)} />
      <Stack.Screen
        name="LnurlPay"
        options={navigationStyle({
          title: '',
        })(theme)}
      />
      <Stack.Screen
        name="LnurlPaySuccess"
        options={navigationStyle({
          title: '',
          headerBackVisible: false,
          gestureEnabled: false,
        })(theme)}
      />
      <Stack.Screen
        name="ScanQRCode"
        // component={ScanQRCodeComponent}
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

export default ScanLndInvoiceRoot;
