import { triggerWarningHapticFeedback } from '../hapticFeedback';
import presentAlert from '@/src/components/Alert';
import loc from '@/src/loc';
import DefaultPreference from 'react-native-default-preference';

import { GROUP_IO_BLUEWALLET } from '../currency';
import { ELECTRUM_HOST, ELECTRUM_SSL_PORT, ELECTRUM_TCP_PORT } from './constants';

export async function presentResetToDefaultsAlert(): Promise<boolean> {
  return new Promise(resolve => {
    triggerWarningHapticFeedback();
    presentAlert({
      title: loc.settings.electrum_reset,
      message: loc.settings.electrum_reset_to_default,
      buttons: [
        {
          text: loc._.cancel,
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: loc._.ok,
          style: 'destructive',
          onPress: async () => {
            try {
              await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
              await DefaultPreference.clear(ELECTRUM_HOST);
              await DefaultPreference.clear(ELECTRUM_SSL_PORT);
              await DefaultPreference.clear(ELECTRUM_TCP_PORT);
            } catch (e) {
              console.log(e); // Must be running on Android
            }
            resolve(true);
          },
        },
      ],
      options: { cancelable: true },
    });
  });
}
