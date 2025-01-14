/** TODO: add theme context */
import React from 'react';
// import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LargeScreenProvider } from './components/Context/LargeScreenProvider';
import { SettingsProvider } from './components/Context/SettingsProvider';
// import { BlueDarkTheme, BlueDefaultTheme } from './components/themes';
import MasterView from './navigation/MasterView';
import { StorageProvider } from './components/Context/StorageProvider';

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const colorScheme = useColorScheme();

  return (
    <LargeScreenProvider>
      <SafeAreaProvider>
        <StorageProvider>
          <SettingsProvider>
            <MasterView>{children}</MasterView>
          </SettingsProvider>
        </StorageProvider>
      </SafeAreaProvider>
    </LargeScreenProvider>
  );
};

export default App;
