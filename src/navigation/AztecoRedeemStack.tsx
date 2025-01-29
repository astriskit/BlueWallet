import React from 'react';
import { Stack } from 'expo-router';

import navigationStyle from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';

const AztecoRedeemStackRoot = () => {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="AztecoRedeem"
        options={navigationStyle({
          title: loc.azteco.title,
          statusBarStyle: 'auto',
        })(theme)}
      />
      <Stack.Screen
        name="SelectWallet"
        options={navigationStyle({
          title: loc.wallets.select_wallet,
        })(theme)}
      />
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default AztecoRedeemStackRoot;
