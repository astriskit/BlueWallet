import React from 'react';
import { Stack } from 'expo-router';

const UnlockStackLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="UnlockWithScreen" />
    </Stack>
  );
};

export default UnlockStackLayout;
