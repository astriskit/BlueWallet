import React from 'react';

import navigationStyle from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';
import { ScanQRCodeParamList } from './DetailViewStackParamList';
import { Stack } from 'expo-router';

export type ViewEditMultisigCosignersStackParamList = {
  ViewEditMultisigCosigners: {
    walletID: string;
    onBarScanned?: string;
  };
  ScanQRCode: ScanQRCodeParamList;
};

const ViewEditMultisigCosignersStackRoot = () => {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="ViewEditMultisigCosigners"
        // component={ViewEditMultisigCosignersComponent}
        options={navigationStyle({
          headerBackVisible: false,
          title: loc.multisig.manage_keys,
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

export default ViewEditMultisigCosignersStackRoot;
