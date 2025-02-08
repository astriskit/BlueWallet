import React from 'react';

import navigationStyle from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';
// import { ReceiveDetailsComponent } from './LazyLoadReceiveDetailsStack';
import { Stack } from 'expo-router';

const ReceiveDetailsStackRoot = () => {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShadowVisible: false }} initialRouteName="ReceiveDetails">
      <Stack.Screen
        name="ReceiveDetails"
        // component={ReceiveDetailsComponent}
        options={navigationStyle({
          headerBackVisible: false,
          title: loc.receive.header,
          statusBarStyle: 'light',
        })(theme)}
      />
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default ReceiveDetailsStackRoot;
