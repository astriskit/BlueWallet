import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Stack } from 'expo-router';

import { isDesktop } from '../blue_modules/environment';
import HeaderRightButton from '../components/HeaderRightButton';
import navigationStyle, { CloseButtonPosition } from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import { useExtendedNavigation } from '../hooks/useExtendedNavigation';
import loc from '../loc';
import { NavigationDefaultOptions, NavigationFormModalOptions, StatusBarLightOptions } from './helpers/options';
import SettingsButton from '../components/icons/SettingsButton';
import getWalletTransactionsOptions from './helpers/getWalletTransactionsOptions';
import { useSettings } from '../hooks/context/useSettings';
import { useStorage } from '../hooks/context/useStorage';
import AddWalletButton from '../components/AddWalletButton';

const DetailViewStackScreensStack = () => {
  const theme = useTheme();
  const navigation = useExtendedNavigation();
  const { wallets } = useStorage();
  const { isTotalBalanceEnabled } = useSettings();

  const DetailButton = useMemo(() => <HeaderRightButton testID="DetailButton" disabled title={loc.send.create_details} />, []);

  const navigateToAddWallet = useCallback(() => {
    navigation.navigate('AddWalletRoot');
  }, [navigation]);

  const RightBarButtons = useMemo(
    () => (
      <>
        <AddWalletButton onPress={navigateToAddWallet} />
        <View style={styles.width24} />
        <SettingsButton />
      </>
    ),
    [navigateToAddWallet],
  );

  const useWalletListScreenOptions = useMemo<NativeStackNavigationOptions>(() => {
    const displayTitle = !isTotalBalanceEnabled || wallets.length <= 1;
    return {
      title: displayTitle ? loc.wallets.wallets : '',
      navigationBarColor: theme.colors.navigationBarColor,
      headerShown: !isDesktop,
      headerLargeTitle: displayTitle,
      headerShadowVisible: false,
      headerLargeTitleShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.customHeader,
      },
      headerRight: () => RightBarButtons,
    };
  }, [RightBarButtons, isTotalBalanceEnabled, theme.colors.customHeader, theme.colors.navigationBarColor, wallets.length]);

  const walletListScreenOptions = useWalletListScreenOptions;

  return (
    <Stack
      initialRouteName="WalletsList"
      screenOptions={{
        headerShadowVisible: false,
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="WalletsList" options={navigationStyle(walletListScreenOptions)(theme)} />
      <Stack.Screen
        name="WalletTransactions"
        // @ts-ignore //TODO: Refactor. why? string != "WalletTransactions"
        options={getWalletTransactionsOptions}
      />
      <Stack.Screen
        name="WalletDetails"
        options={navigationStyle({
          headerTitle: loc.wallets.details_title,
          statusBarStyle: 'auto',
        })(theme)}
      />
      <Stack.Screen
        name="TransactionDetails"
        options={navigationStyle({
          statusBarStyle: 'auto',
          headerStyle: {
            backgroundColor: theme.colors.customHeader,
          },
          headerTitle: loc.transactions.details_title,
        })(theme)}
      />
      <Stack.Screen
        name="TransactionStatus"
        initialParams={{
          hash: undefined,
          walletID: undefined,
        }}
        options={navigationStyle({
          title: '',
          statusBarStyle: 'auto',
          headerStyle: {
            backgroundColor: theme.colors.customHeader,
          },
          headerRight: () => DetailButton,
          headerBackTitleStyle: { fontSize: 0 },
          // headerBackTitleVisible: true, // TODO: refactor
        })(theme)}
      />
      <Stack.Screen name="CPFP" options={navigationStyle({ title: loc.transactions.cpfp_title })(theme)} />
      <Stack.Screen name="RBFBumpFee" options={navigationStyle({ title: loc.transactions.rbf_title })(theme)} />
      <Stack.Screen name="RBFCancel" options={navigationStyle({ title: loc.transactions.cancel_title })(theme)} />
      <Stack.Screen name="SelectWallet" options={navigationStyle({ title: loc.wallets.select_wallet })(theme)} />
      <Stack.Screen
        name="LNDViewInvoice"
        options={navigationStyle({
          statusBarStyle: 'auto',
          headerTitle: loc.lndViewInvoice.lightning_invoice,
          headerStyle: {
            backgroundColor: theme.colors.customHeader,
          },
        })(theme)}
      />
      <Stack.Screen
        name="LNDViewAdditionalInvoiceInformation"
        options={navigationStyle({ title: loc.lndViewInvoice.additional_info })(theme)}
      />
      <Stack.Screen
        name="LNDViewAdditionalInvoicePreImage"
        options={navigationStyle({ title: loc.lndViewInvoice.additional_info })(theme)}
      />

      <Stack.Screen name="Broadcast" options={navigationStyle({ title: loc.send.create_broadcast })(theme)} />
      <Stack.Screen
        name="IsItMyAddress"
        initialParams={{ address: undefined }}
        options={navigationStyle({ title: loc.is_it_my_address.title })(theme)}
      />
      <Stack.Screen name="GenerateWord" options={navigationStyle({ title: loc.autofill_word.title })(theme)} />
      <Stack.Screen
        name="LnurlPay"
        options={navigationStyle({
          title: '',
          closeButtonPosition: CloseButtonPosition.Right,
        })(theme)}
      />
      <Stack.Screen name="PaymentCodeList" options={navigationStyle({ title: loc.bip47.contacts })(theme)} />

      <Stack.Screen
        name="LnurlPaySuccess"
        options={navigationStyle({
          title: '',
          closeButtonPosition: CloseButtonPosition.Right,
          headerBackVisible: false,
          gestureEnabled: false,
        })(theme)}
      />
      <Stack.Screen name="LnurlAuth" options={navigationStyle({ title: '' })(theme)} />
      <Stack.Screen
        name="Success"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="WalletAddresses"
        options={navigationStyle({
          title: loc.addresses.addresses_title,
          statusBarStyle: 'auto',
        })(theme)}
      />

      <Stack.Screen name="AztecoRedeemRoot" options={NavigationDefaultOptions} />
      {/* screens */}
      <Stack.Screen name="WalletExportRoot" options={{ ...NavigationDefaultOptions, ...StatusBarLightOptions }} />
      <Stack.Screen name="ExportMultisigCoordinationSetupRoot" options={NavigationDefaultOptions} />
      <Stack.Screen
        name="Settings"
        options={navigationStyle({
          headerTransparent: true,
          title: loc.settings.header,
          // workaround to deal with the flicker when headerBackTitleVisible is false
          headerBackTitleStyle: { fontSize: 0 },
          // headerBackTitleVisible: true, // TODO: refactor
          headerShadowVisible: false,
          headerLargeTitle: true,
          animationTypeForReplace: 'push',
        })(theme)}
      />
      <Stack.Screen name="Currency" options={navigationStyle({ title: loc.settings.currency })(theme)} />
      <Stack.Screen name="GeneralSettings" options={navigationStyle({ title: loc.settings.general })(theme)} />
      <Stack.Screen name="PlausibleDeniability" options={navigationStyle({ title: loc.plausibledeniability.title })(theme)} />
      <Stack.Screen name="Licensing" options={navigationStyle({ title: loc.settings.license })(theme)} />
      <Stack.Screen name="NetworkSettings" options={navigationStyle({ title: loc.settings.network })(theme)} />
      <Stack.Screen name="SettingsBlockExplorer" options={navigationStyle({ title: loc.settings.block_explorer })(theme)} />

      <Stack.Screen name="About" options={navigationStyle({ title: loc.settings.about })(theme)} />
      <Stack.Screen name="DefaultView" options={navigationStyle({ title: loc.settings.default_title })(theme)} />
      <Stack.Screen
        name="ElectrumSettings"
        options={navigationStyle({
          title: loc.settings.electrum_settings_server,
        })(theme)}
        initialParams={{ server: undefined }}
      />
      <Stack.Screen name="EncryptStorage" options={navigationStyle({ title: loc.settings.encrypt_title })(theme)} />
      <Stack.Screen name="Language" options={navigationStyle({ title: loc.settings.language })(theme)} />
      <Stack.Screen name="LightningSettings" options={navigationStyle({ title: loc.settings.lightning_settings })(theme)} />
      <Stack.Screen name="NotificationSettings" options={navigationStyle({ title: loc.settings.notifications })(theme)} />
      <Stack.Screen name="SelfTest" options={navigationStyle({ title: loc.settings.selfTest })(theme)} />
      <Stack.Screen name="ReleaseNotes" options={navigationStyle({ title: loc.settings.about_release_notes })(theme)} />
      <Stack.Screen name="ToolsScreen" options={navigationStyle({ title: loc.settings.tools })(theme)} />
      <Stack.Screen name="SettingsPrivacy" options={navigationStyle({ title: loc.settings.privacy })(theme)} />
      <Stack.Screen name="SignVerifyRoot" options={{ ...NavigationDefaultOptions, ...StatusBarLightOptions }} />
      <Stack.Screen name="ReceiveDetailsRoot" options={NavigationDefaultOptions} />
      <Stack.Screen
        name="ManageWallets"
        options={navigationStyle({
          headerBackVisible: false,
          gestureEnabled: false,
          presentation: 'containedModal',
          title: loc.wallets.manage_title,
          statusBarStyle: 'auto',
        })(theme)}
      />
      <Stack.Screen
        name="AddWalletRoot"
        options={navigationStyle({
          closeButtonPosition: CloseButtonPosition.Left,
          ...NavigationFormModalOptions,
        })(theme)}
      />
      <Stack.Screen name="SendDetailsRoot" options={NavigationFormModalOptions} />
      <Stack.Screen name="LNDCreateInvoiceRoot" options={NavigationDefaultOptions} />
      <Stack.Screen name="ScanLndInvoiceRoot" options={NavigationDefaultOptions} />
      {/* screens */}
      <Stack.Screen name="WalletXpubRoot" options={{ ...NavigationDefaultOptions, ...StatusBarLightOptions }} />
      <Stack.Screen
        name="ViewEditMultisigCosignersRoot"
        options={{
          ...NavigationDefaultOptions,
          ...StatusBarLightOptions,
          gestureEnabled: false,
          fullScreenGestureEnabled: false,
        }}
        initialParams={{ walletID: undefined, cosigners: undefined }}
      />
      <Stack.Screen
        name="ScanQRCode"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          statusBarHidden: true,
        }}
      />
    </Stack>
  );
};

export default DetailViewStackScreensStack;

const styles = {
  width24: {
    width: 24,
  },
  walletDetails: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
};
