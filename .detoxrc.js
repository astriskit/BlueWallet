/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    $0: "jest",
    args: {
      config: "tests/e2e/jest.config.js",
      _: ["e2e"],
    },
  },
  apps: {
    ios: {
      type: "ios.app",
      binaryPath: "SPECIFY_PATH_TO_YOUR_APP_BINARY",
      build:
        "xcodebuild clean build -workspace ios/BlueWallet.xcworkspace -scheme BlueWallet -configuration Release -derivedDataPath ios/build -sdk iphonesimulator13.2",
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build:
        "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..",
    },
    "android.release": {
      type: "android.apk",
      testBinaryPath:
        "android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk",
      binaryPath: "android/app/build/outputs/apk/release/app-release.apk",
      build: "./tests/e2e/detox-build-release-apk.sh",
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 11",
      },
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_6_API_33",
      },
    },
  },
  configurations: {
    ios: {
      device: "simulator",
      app: "ios",
    },
    "android.debug": {
      device: "emulator",
      app: "android.debug",
    },
    "android.release": {
      device: "emulator",
      app: "android.release",
    },
  },
};
