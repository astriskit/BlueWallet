import React, { useMemo } from 'react';
import { Stack } from 'expo-router';

import navigationStyle, { CloseButtonPosition } from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';
import HeaderRightButton from '../components/HeaderRightButton';
import { BitcoinUnit } from '../models/bitcoinUnits';

const SendDetailsStack = () => {
  const theme = useTheme();
  const DetailsButton = useMemo(() => <HeaderRightButton testID="TransactionDetailsButton" disabled title={loc.send.create_details} />, []);

  return (
    <Stack initialRouteName="SendDetails" screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="SendDetails"
        options={navigationStyle({
          title: loc.send.header,
          // statusBarStyle: 'light',
          closeButtonPosition: CloseButtonPosition.Left,
        })(theme)}
        initialParams={{
          isEditable: true,
          feeUnit: BitcoinUnit.BTC,
          amountUnit: BitcoinUnit.BTC,
        }} // Correctly typed now
      />
      <Stack.Screen
        name="Confirm"
        options={navigationStyle({
          title: loc.send.confirm_header,
          headerRight: () => DetailsButton,
        })(theme)}
      />
      <Stack.Screen
        name="PsbtWithHardwareWallet"
        options={navigationStyle({
          title: loc.send.header,
          gestureEnabled: false,
          fullScreenGestureEnabled: false,
        })(theme)}
      />
      <Stack.Screen name="CreateTransaction" options={navigationStyle({ title: loc.send.create_details })(theme)} />
      <Stack.Screen name="PsbtMultisig" options={navigationStyle({ title: loc.multisig.header })(theme)} />
      <Stack.Screen name="PsbtMultisigQRCode" options={navigationStyle({ title: loc.multisig.header })(theme)} />
      <Stack.Screen name="Success" options={navigationStyle({ headerShown: false, gestureEnabled: false })(theme)} />
      <Stack.Screen name="SelectWallet" options={navigationStyle({ title: loc.wallets.select_wallet })(theme)} />
      <Stack.Screen name="CoinControl" options={navigationStyle({ title: loc.cc.header })(theme)} />
      <Stack.Screen name="PaymentCodeList" options={navigationStyle({ title: loc.bip47.contacts })(theme)} />
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
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default SendDetailsStack;
