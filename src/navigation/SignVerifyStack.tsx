import React from 'react';

import navigationStyle from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc';
// import { SignVerifyComponent } from './LazyLoadSignVerifyStack';
import { Stack } from 'expo-router';

const SignVerifyStackRoot = () => {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="SignVerify"
        // component={SignVerifyComponent}
        options={navigationStyle({ headerBackVisible: false, statusBarStyle: 'light', title: loc.addresses.sign_title })(theme)}
      />
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default SignVerifyStackRoot;
