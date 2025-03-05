import 'ts-node/register';

import { ConfigPlugin, withGradleProperties, withPlugins } from 'expo/config-plugins';

import { withPushNotification } from '@astriskit/rn-push-notification-config';
import { withPushNotificationIOS } from '@astriskit/rn-community-push-notification-ios-config';
import { ConfigContext, ExpoConfig } from 'expo/config';

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
  // Add environment variables for APIs
  const updatedConfig = {
    ...config,
    extra: {
      ...config.extra,
      // Ethereum API keys (set these in eas.json or use expo-updates for production)
      etherscanApiKey: process.env.ETHERSCAN_API_KEY || 'YOUR_API_KEY_HERE',
    },
  };

  // @ts-ignore config!
  return withPlugins(updatedConfig, [
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
