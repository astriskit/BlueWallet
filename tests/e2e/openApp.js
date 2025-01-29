const appConfig = require('../../app.json');
const { resolveConfig } = require('detox/internals');

const platform = device.getPlatform();

module.exports.openApp = async function openApp(deviceInstallOptions = {}) {
  const config = await resolveConfig();
  if (config.configurationName.split('.')[1] === 'debug') {
    await openAppForDebugBuild(platform, deviceInstallOptions);
  } else {
    if (platform === 'ios' && deviceInstallOptions?.delete) {
      await device.clearKeychain();
    }
    await device.launchApp({
      newInstance: true,
      ...deviceInstallOptions,
    });
  }
};

async function openAppForDebugBuild(platform, deviceInstallOptions = {}) {
  const deepLinkUrl = process.env.EXPO_USE_UPDATES
    ? // Testing latest published EAS update for the test_debug channel
      getDeepLinkUrl(getLatestUpdateUrl())
    : // Local testing with packager
      getDeepLinkUrl(getDevLauncherPackagerUrl(platform));

  if (platform === 'ios') {
    if (deviceInstallOptions?.delete) {
      await device.clearKeychain();
    }
    await device.launchApp({
      newInstance: true,
      ...deviceInstallOptions,
    });
    await sleep(3000);
    await device.openURL({
      url: deepLinkUrl,
    });
  } else {
    await device.launchApp({
      newInstance: true,
      url: deepLinkUrl,
      ...deviceInstallOptions,
    });
  }

  await sleep(3000);
}

const getDeepLinkUrl = url => `bluewallet://expo-development-client/?url=${encodeURIComponent(url)}`;

const getDevLauncherPackagerUrl = platform => `http:/localhost:8081/?disableOnboarding=1`;

const getLatestUpdateUrl = () => `https://u.expo.dev/${getAppId()}?channel-name=test_debug&disableOnboarding=1`;

const getAppId = () => appConfig?.expo?.extra?.eas?.projectId ?? '';

const sleep = t => new Promise(res => setTimeout(res, t));
