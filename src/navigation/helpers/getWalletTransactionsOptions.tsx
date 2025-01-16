import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import WalletGradient from '../../class/wallet-gradient';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { DetailViewStackParamList } from '../DetailViewStackParamList';
import { router } from '../../NavigationService';

export type WalletTransactionsRouteParams = DetailViewStackParamList['WalletTransactions']

const getWalletTransactionsOptions = (params: WalletTransactionsRouteParams): NativeStackNavigationOptions => {
  const { isLoading = false, walletID = undefined, walletType = undefined } = params;

  const onPress = () => {
    router.navigate({
      pathname: '/WalletDetails',
      params: {
        walletID,
      },
    });
  };

  const RightButton = (
    <TouchableOpacity accessibilityRole="button" testID="WalletDetails" disabled={isLoading} style={styles.walletDetails} onPress={onPress}>
      <Icon name="more-horiz" type="material" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );

  const backgroundColor = walletType && WalletGradient.headerColorFor(walletType);

  return {
    title: '',
    headerBackTitleStyle: { fontSize: 0 },
    headerStyle: {
      backgroundColor,
    },
    headerShadowVisible: false,
    headerTintColor: '#FFFFFF',
    headerBackTitleVisible: true,
    headerRight: () => RightButton,
  };
};

const styles = StyleSheet.create({
  walletDetails: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});

export default getWalletTransactionsOptions;
