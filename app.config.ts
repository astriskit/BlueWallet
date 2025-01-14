import { ExpoConfig, ConfigContext } from 'expo/config';
import { ConfigPlugin, withGradleProperties, withPlugins } from 'expo/config-plugins';


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
  ]);
};
