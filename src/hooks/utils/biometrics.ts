import { Alert, Platform } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store';

import loc from '@/src/loc';
import presentAlert from '@/src/components/Alert';
import { reset } from '@/src/NavigationService';

export const STORAGEKEY = 'Biometrics';

export const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export const clearKeychain = async () => {
  try {
    console.debug('Wiping keychain');
    console.debug('Wiping key: data');
    await RNSecureKeyStore.set('data', JSON.stringify({ data: { wallets: [] } }), {
      accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    console.debug('Wiped key: data');
    console.debug('Wiping key: data_encrypted');
    await RNSecureKeyStore.set('data_encrypted', '', { accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    console.debug('Wiped key: data_encrypted');
    console.debug('Wiping key: STORAGEKEY');
    await RNSecureKeyStore.set(STORAGEKEY, '', { accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    console.debug('Wiped key: STORAGEKEY');
    reset();
  } catch (error: any) {
    console.warn(error);
    presentAlert({ message: error.message });
  }
};

export const unlockWithBiometrics = async () => {
  try {
    const { available } = await rnBiometrics.isSensorAvailable();
    if (!available) {
      return false;
    }

    return new Promise<boolean>(resolve => {
      rnBiometrics
        .simplePrompt({ promptMessage: loc.settings.biom_conf_identity })
        .then((result: { success: any }) => {
          if (result.success) {
            resolve(true);
          } else {
            console.debug('Biometrics authentication failed');
            resolve(false);
          }
        })
        .catch((error: Error) => {
          console.debug('Biometrics authentication error');
          presentAlert({ message: error.message });
          resolve(false);
        });
    });
  } catch (e: Error | any) {
    console.debug('Biometrics authentication error', e);
    presentAlert({ message: e.message });
    return false;
  }
};

export const showKeychainWipeAlert = () => {
  if (Platform.OS === 'ios') {
    Alert.alert(
      loc.settings.encrypt_tstorage,
      loc.settings.biom_10times,
      [
        {
          text: loc._.cancel,
          onPress: () => {
            console.debug('Cancel Pressed');
          },
          style: 'cancel',
        },
        {
          text: loc._.ok,
          onPress: async () => {
            const { available } = await rnBiometrics.isSensorAvailable();
            if (!available) {
              presentAlert({ message: loc.settings.biom_no_passcode });
              return;
            }
            const isAuthenticated = await unlockWithBiometrics();
            if (isAuthenticated) {
              Alert.alert(
                loc.settings.encrypt_tstorage,
                loc.settings.biom_remove_decrypt,
                [
                  { text: loc._.cancel, style: 'cancel' },
                  {
                    text: loc._.ok,
                    style: 'destructive',
                    onPress: async () => await clearKeychain(),
                  },
                ],
                { cancelable: false },
              );
            }
          },
          style: 'default',
        },
      ],
      { cancelable: false },
    );
  }
};
