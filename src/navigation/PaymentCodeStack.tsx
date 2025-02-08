import React from 'react';
import { Stack } from 'expo-router';
import navigationStyle from '../components/navigationStyle';
import { useTheme } from '../components/themes';
import loc from '../loc'; // Assuming 'loc' is used for localization
// import { PaymentCodeStackParamList } from './PaymentCodeStackParamList';
// import PaymentCodesListComponent from './LazyLoadPaymentCodeStack';

const PaymentCodeStackRoot = () => {
  const theme = useTheme();

  return (
    <Stack initialRouteName="PaymentCodesList" screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="PaymentCodesList" options={navigationStyle({ title: loc.bip47.contacts })(theme)} />
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default PaymentCodeStackRoot;
