import React, { lazy, Suspense } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { FAB as Fab } from '@rneui/themed';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useStorage } from '../hooks/context/useStorage';
import DevMenu from '../components/DevMenu';
import SafeArea from '../components/SafeArea';

const CompanionDelegates = lazy(() => import('../components/CompanionDelegates'));

const MasterView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletsInitialized } = useStorage();

  const goBack = () => {
    if (router.canDismiss()) {
      router.back();
    }
  };

  return (
    <>
      <GestureHandlerRootView style={styles.root}>
        {children}
        {walletsInitialized && (
          <Suspense>
            <CompanionDelegates />
          </Suspense>
        )}
      </GestureHandlerRootView>
      {__DEV__ && <DevMenu />}
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default MasterView;
