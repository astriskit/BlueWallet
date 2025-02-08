import React from 'react';

import { isHandset } from '@/src/blue_modules/environment';
import DrawerRoot from '@/src/navigation/DrawerRoot';
import { Stack } from 'expo-router';

const DrawerOrStackDetailsViewStackRoot = () => {
  if (!isHandset) {
    return <DrawerRoot />;
  }

  return (
    <Stack
      initialRouteName="(DetailViewStackScreensStack)"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(DetailViewStackScreensStack)" />
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default DrawerOrStackDetailsViewStackRoot;
