module.exports = {
  testEnvironment: '<rootDir>/tests/custom-environment.js',
  reporters: ['default', ['<rootDir>/tests/custom-reporter.js', {}]],
  preset: 'jest-expo',
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@rneui|silent-payments)',
  ],
  setupFiles: ['./tests/setup.js'],
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
  setupFilesAfterEnv: ['./tests/setupAfterEnv.js'],
};
