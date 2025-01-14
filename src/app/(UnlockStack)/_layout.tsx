import React from 'react';
import { Stack } from 'expo-router';

const UnlockStackLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'push',
      }}
    />
  );
};

export default UnlockStackLayout;
