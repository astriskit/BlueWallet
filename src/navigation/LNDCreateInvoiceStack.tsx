import React from 'react';
import { Stack } from 'expo-router';

import navigationStyle, { CloseButtonPosition } from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';

const LNDCreateInvoiceRoot = () => {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="LNDCreateInvoice"
        options={navigationStyle({
          title: loc.receive.header,
          closeButtonPosition: CloseButtonPosition.Right,
          headerBackVisible: false,
          // statusBarStyle: 'light',
        })(theme)}
      />
      <Stack.Screen name="SelectWallet" options={navigationStyle({ title: loc.wallets.select_wallet })(theme)} />
      <Stack.Screen
        name="LNDViewInvoice"
        options={navigationStyle({
          // statusBarStyle: 'auto',
          headerTitle: loc.lndViewInvoice.lightning_invoice,
          headerStyle: {
            backgroundColor: theme.colors.customHeader,
          },
        })(theme)}
      />
      <Stack.Screen
        name="LNDViewAdditionalInvoiceInformation"
        options={navigationStyle({ title: loc.lndViewInvoice.additional_info })(theme)}
      />
      <Stack.Screen
        name="LNDViewAdditionalInvoicePreImage"
        options={navigationStyle({ title: loc.lndViewInvoice.additional_info })(theme)}
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
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default LNDCreateInvoiceRoot;
