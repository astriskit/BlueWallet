import '@/shim.js';

import 'react-native-gesture-handler'; // should be on top

import React, { useEffect } from 'react';
import { LogBox } from 'react-native';

import App from './App';
// import A from './blue_modules/analytics';
import { restoreSavedPreferredFiatCurrencyAndExchangeFromStorage } from './blue_modules/currency';

if (!Error.captureStackTrace) {
  // captureStackTrace is only available when debugging
  Error.captureStackTrace = () => {};
}

LogBox.ignoreLogs([
  'Require cycle:',
  'Battery state `unknown` and monitoring disabled, this is normal for simulators and tvOS.',
  'Open debugger to view warnings.',
]);

export const BlueAppComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    restoreSavedPreferredFiatCurrencyAndExchangeFromStorage();
    // A(A.ENUM.INIT); // TODO: add later
  }, []);
  return <App>{children}</App>;
};
