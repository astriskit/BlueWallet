import 'ts-node/register';

import { ConfigPlugin, withGradleProperties, withPlugins } from 'expo/config-plugins';

import { withPushNotification } from '@astriskit/rn-push-notification-config';
import { withPushNotificationIOS } from '@astriskit/rn-community-push-notification-ios-config';

const withJettifier: ConfigPlugin<boolean> = (_, enable = false) =>
  withGradleProperties(_, config => {
    config.modResults.push({
      type: 'property',
      value: enable ? 'true' : 'false',
      key: 'android.enableJetifier',
    });
    return config;
  });

export default ({ config }: ConfigContext): ExpoConfig => {
  // @ts-ignore config!
  return withPlugins(config, [
    [withJettifier, true],
    withPushNotificationIOS,
    [
      withPushNotification,
      {
        color: { name: 'colorPrimary' },
        defaultChannel: true,
        channels: [{ name: 'BlueWallet notifications', description: 'Notifications about incoming payments' }],
      },
    ],
  ]);
};
