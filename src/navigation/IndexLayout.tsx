import React, { Suspense } from 'react';
import { LazyLoadingIndicator } from './LazyLoadingIndicator';
import { Stack } from 'expo-router';

const IndexLayout = () => {
  return (
    <Suspense fallback={<LazyLoadingIndicator />}>
      <Stack initialRouteName="(DrawerDetailViewStack)">
        <Stack.Screen name="(DrawerDetailViewStack)" />
        <Stack.Screen name="(UnlockStack)" />
      </Stack>
    </Suspense>
  );
};

export default IndexLayout;
