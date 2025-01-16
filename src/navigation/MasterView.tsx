import React, { lazy, Suspense } from 'react';
import { StyleSheet } from 'react-native';

import { useStorage } from '../hooks/context/useStorage';
import DevMenu from '../components/DevMenu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const CompanionDelegates = lazy(() => import('../components/CompanionDelegates'));

const MasterView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletsInitialized } = useStorage();

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
