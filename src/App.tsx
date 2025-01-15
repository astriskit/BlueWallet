import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LargeScreenProvider } from './components/Context/LargeScreenProvider';
import { SettingsProvider } from './components/Context/SettingsProvider';
import { BlueDarkTheme, BlueDefaultTheme } from './components/themes';
import MasterView from './navigation/MasterView';
import { StorageProvider } from './components/Context/StorageProvider';
import { ThemeProvider } from '@react-navigation/native';

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();

  return (
    <LargeScreenProvider>
      <ThemeProvider value={colorScheme === 'dark' ? BlueDarkTheme : BlueDefaultTheme}>
        <SafeAreaProvider>
          <StorageProvider>
            <SettingsProvider>
              <MasterView>{children}</MasterView>
            </SettingsProvider>
          </StorageProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </LargeScreenProvider>
  );
};

export default App;
