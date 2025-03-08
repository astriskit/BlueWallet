import React, { useMemo, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, LayoutAnimation, View } from 'react-native';
import { useStorage } from '../hooks/context/useStorage';
import loc from '../loc';
import { CryptoUnit } from '../models/cryptoUnits';
import ToolTipMenu from './TooltipMenu';
import { CommonToolTipActions } from '../typings/CommonToolTipActions';
import { useSettings } from '../hooks/context/useSettings';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from './themes';
import {
  btcToSatoshi,
  ethToWei,
  fiatToBTC,
  fiatToETH,
  getCurrencyFormatter,
  satoshiToLocalCurrency,
  weiToLocalCurrency,
} from '../blue_modules/currency';

const TotalWalletsBalance: React.FC = React.memo(() => {
  const { wallets } = useStorage();
  const {
    preferredFiatCurrency,
    isTotalBalanceEnabled,
    setIsTotalBalanceEnabledStorage,
    totalBalancePreferredUnit,
    setTotalBalancePreferredUnitStorage,
  } = useSettings();
  const { colors } = useTheme();

  const totalBalanceFormatted = useMemo(() => {
    const totalEthBalance = wallets
      .filter(w => w.type === 'ethereum')
      .reduce((prev, curr) => {
        return curr.hideBalance ? prev : prev + (curr.getBalance() || 0);
      }, 0);

    const fiatTotalEthBalance = weiToLocalCurrency(totalEthBalance, false);

    const totalBtcBalance = wallets
      .filter(w => w.type !== 'ethereum')
      .reduce((prev, curr) => {
        return curr.hideBalance ? prev : prev + (curr.getBalance() || 0);
      }, 0);
    const fiatTotalBtcBalance = satoshiToLocalCurrency(totalBtcBalance, false);

    const fiatTotalBalance = Number(fiatTotalBtcBalance) + Number(fiatTotalEthBalance);
    let outV;
    switch (totalBalancePreferredUnit) {
      case 'BTC':
      case 'sats':
        outV = fiatToBTC(fiatTotalBalance);
        if (totalBalancePreferredUnit === 'BTC') return outV;
        return btcToSatoshi(outV);
      case 'gwei':
      case 'ETH':
        outV = fiatToETH(fiatTotalBalance);
        if (totalBalancePreferredUnit === 'ETH') return outV;
        return ethToWei(outV);
      case 'local_currency':
      default:
        return getCurrencyFormatter().format(fiatTotalBalance);
    }
  }, [totalBalancePreferredUnit, wallets]);

  const toolTipActions = useMemo(
    () => [
      {
        id: 'viewInActions',
        text: '',
        displayInline: true,
        subactions: [
          {
            ...CommonToolTipActions.ViewInFiat,
            text: loc.formatString(loc.total_balance_view.display_in_fiat, { currency: preferredFiatCurrency.endPointKey }),
            hidden: totalBalancePreferredUnit === CryptoUnit.LOCAL_CURRENCY,
          },
          { ...CommonToolTipActions.ViewInSats, hidden: totalBalancePreferredUnit === CryptoUnit.SATS },
          { ...CommonToolTipActions.ViewInBitcoin, hidden: totalBalancePreferredUnit === CryptoUnit.BTC },
          { ...CommonToolTipActions.ViewInEth, hidden: totalBalancePreferredUnit === CryptoUnit.ETH },
          { ...CommonToolTipActions.ViewInGwei, hidden: totalBalancePreferredUnit === CryptoUnit.GWEI },
        ],
      },
      CommonToolTipActions.CopyAmount,
      CommonToolTipActions.Hide,
    ],
    [preferredFiatCurrency, totalBalancePreferredUnit],
  );

  const onPressMenuItem = useCallback(
    async (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      switch (id) {
        case CommonToolTipActions.ViewInFiat.id:
          await setTotalBalancePreferredUnitStorage(CryptoUnit.LOCAL_CURRENCY);
          break;
        case CommonToolTipActions.ViewInSats.id:
          await setTotalBalancePreferredUnitStorage(CryptoUnit.SATS);
          break;
        case CommonToolTipActions.ViewInBitcoin.id:
          await setTotalBalancePreferredUnitStorage(CryptoUnit.BTC);
          break;
        case CommonToolTipActions.ViewInEth.id:
          await setTotalBalancePreferredUnitStorage(CryptoUnit.ETH);
          break;
        case CommonToolTipActions.ViewInGwei.id:
          await setTotalBalancePreferredUnitStorage(CryptoUnit.GWEI);
          break;
        case CommonToolTipActions.Hide.id:
          await setIsTotalBalanceEnabledStorage(false);
          break;
        case CommonToolTipActions.CopyAmount.id:
          Clipboard.setStringAsync(totalBalanceFormatted.toString());
          break;
        default:
          break;
      }
    },
    [setIsTotalBalanceEnabledStorage, totalBalanceFormatted, setTotalBalancePreferredUnitStorage],
  );

  const handleBalanceOnPress = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    let nextUnit: CryptoUnit;

    // Handle cycling through Bitcoin units
    if (totalBalancePreferredUnit === CryptoUnit.BTC) {
      nextUnit = CryptoUnit.SATS;
    } else if (totalBalancePreferredUnit === CryptoUnit.SATS) {
      nextUnit = CryptoUnit.ETH;
    } else if (totalBalancePreferredUnit === CryptoUnit.ETH) {
      nextUnit = CryptoUnit.GWEI;
    } else if (totalBalancePreferredUnit === CryptoUnit.GWEI) {
      nextUnit = CryptoUnit.LOCAL_CURRENCY;
    } else {
      nextUnit = CryptoUnit.BTC;
    }

    await setTotalBalancePreferredUnitStorage(nextUnit);
  }, [totalBalancePreferredUnit, setTotalBalancePreferredUnitStorage]);

  if (wallets.length <= 1 || !isTotalBalanceEnabled) return null;

  return (
    <ToolTipMenu actions={toolTipActions} onPressMenuItem={onPressMenuItem}>
      <View style={styles.container}>
        <Text style={styles.label}>{loc.wallets.total_balance}</Text>
        <TouchableOpacity onPress={handleBalanceOnPress}>
          <Text style={[styles.balance, { color: colors.foregroundColor }]}>
            {totalBalanceFormatted}{' '}
            {totalBalancePreferredUnit !== CryptoUnit.LOCAL_CURRENCY && (
              <Text style={[styles.currency, { color: colors.foregroundColor }]}>{totalBalancePreferredUnit}</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </ToolTipMenu>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#9BA0A9',
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TotalWalletsBalance;
