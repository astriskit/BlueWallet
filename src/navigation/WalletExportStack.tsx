import React from 'react';

import navigationStyle from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';
import { Stack } from 'expo-router';

export type WalletExportStackParamList = {
  WalletExport: { walletID: string };
};

const WalletExportStack = () => {
  const theme = useTheme();

  return (
    <Stack>
      <Stack.Screen
        name="WalletExport"
        options={navigationStyle({
          headerBackVisible: false,
          title: loc.wallets.export_title,
        })(theme)}
      />
    </Stack>
  );
};

export default WalletExportStack;
