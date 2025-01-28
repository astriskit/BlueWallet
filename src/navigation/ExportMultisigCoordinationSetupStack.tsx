import React from 'react';
import { Stack } from 'expo-router';

import navigationStyle from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';

export type ExportMultisigCoordinationSetupStackRootParamList = {
  ExportMultisigCoordinationSetup: {
    walletID: string;
  };
};

const ExportMultisigCoordinationSetupStack = () => {
  const theme = useTheme();

  return (
    <Stack initialRouteName="ExportMultisigCoordinationSetup">
      <Stack.Screen
        name="ExportMultisigCoordinationSetup"
        options={navigationStyle({
          headerBackVisible: false,
          // statusBarStyle: 'light',
          title: loc.multisig.export_coordination_setup,
        })(theme)}
      />
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default ExportMultisigCoordinationSetupStack;
