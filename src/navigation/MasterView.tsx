import React, { lazy, Suspense } from 'react';
import { StyleSheet } from 'react-native';
import { FAB as Fab } from '@rneui/themed';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useStorage } from '../hooks/context/useStorage';
import DevMenu from '../components/DevMenu';
import SafeArea from '../components/SafeArea';

const CompanionDelegates = lazy(() => import('../components/CompanionDelegates'));

// TODO: move this to environment/app.config
const __E2E_TESTING__ = false; // toggle when building for end to end testing, particularly for ios.

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
      {__E2E_TESTING__ && (
        <SafeArea style={styles.back}>
          <Fab title="<" size="small" testID="GO_BACK" onPress={goBack} />
        </SafeArea>
      )}
      {__DEV__ && <DevMenu />}
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  back: {
    flex: 0.0125,
  },
});

export default MasterView;
