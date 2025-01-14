import React from 'react';
import { useStorage } from '../hooks/context/useStorage';
import { Redirect } from 'expo-router';

// export const NavigationDefaultOptions  = {
//   headerShown: false,
//   presentation: 'modal',
//   headerShadowVisible: false,
// };
// export const NavigationFormModalOptions: NativeStackNavigationOptions = {
//   headerShown: false,
//   presentation: 'formSheet',
// };

// export const StatusBarLightOptions: NativeStackNavigationOptions = { statusBarStyle: 'light' };

const MainRoot = () => {
  const { walletsInitialized } = useStorage();

  if (!walletsInitialized) {
    return <Redirect href="/UnlockWithScreen" />;
  }
  return <Redirect href="/WalletsList" />;
};

export default MainRoot;
