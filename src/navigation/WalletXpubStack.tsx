import { Stack } from 'expo-router';
import React from 'react';

import navigationStyle from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';

const WalletXpubStackRoot = () => {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShadowVisible: false, statusBarStyle: 'light' }} initialRouteName="WalletXpub">
      <Stack.Screen
        name="WalletXpub"
        options={navigationStyle({
          headerBackVisible: false,
          headerTitle: loc.wallets.xpub_title,
        })(theme)}
      />
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default WalletXpubStackRoot;
