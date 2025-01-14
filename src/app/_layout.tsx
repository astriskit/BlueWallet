import React from 'react';

import { useQuickActionRouting } from 'expo-quick-actions/router';

import { BlueAppComponent } from '../index';
import IndexLayout from '../navigation/IndexLayout';

const AppLayout = () => {
  useQuickActionRouting(); // refer: https://github.com/EvanBacon/expo-quick-actions?tab=readme-ov-file#expo-router
  return (
    <BlueAppComponent>
      <IndexLayout />
    </BlueAppComponent>
  );
};

export default AppLayout;
