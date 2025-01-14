// DrawerRoot.tsx
import { Drawer } from 'expo-router/drawer';
import React, { useLayoutEffect, useMemo } from 'react';
import { I18nManager, LayoutAnimation, StyleSheet } from 'react-native';

import { isHandset } from '../blue_modules/environment';
import { useIsLargeScreen } from '../hooks/useIsLargeScreen';
import DrawerList from '../screen/wallets/DrawerList';
import { useSettings } from '../hooks/context/useSettings';
import { DrawerNavigationOptions } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const DrawerListContent = (props: any) => {
  return <DrawerList {...props} />;
};

const DrawerRoot = () => {
  const { isLargeScreen } = useIsLargeScreen();
  const { isDrawerShouldHide } = useSettings();

  const drawerStyle: DrawerNavigationOptions = useMemo(() => {
    if (isHandset) return {};
    return {
      drawerPosition: I18nManager.isRTL ? 'right' : 'left',
      drawerStyle: { width: isLargeScreen && !isDrawerShouldHide ? 320 : '0%' },
      drawerType: isLargeScreen ? 'permanent' : 'back',
    };
  }, [isDrawerShouldHide, isLargeScreen]);

  useLayoutEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isDrawerShouldHide]);

  return (
    <GestureHandlerRootView style={DrawerRootStyles.root}>
      <Drawer screenOptions={drawerStyle} drawerContent={isHandset ? undefined : DrawerListContent}>
        <Drawer.Screen
          name="(DetailViewStackScreensStack)"
          options={{
            headerShown: false,
            configureGestureHandler: isHandset
              ? undefined
              : gesture => {
                  return gesture.enableTrackpadTwoFingerGesture(true);
                },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

const DrawerRootStyles = StyleSheet.create({
  root: { flex: 1 },
});

export default DrawerRoot;
