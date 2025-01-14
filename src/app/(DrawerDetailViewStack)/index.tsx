import React from 'react';
import { Redirect } from 'expo-router';

const UndefinedPath = () => {
  console.warn('This is undefined path');
  return <Redirect href="/WalletsList" />;
};

export default UndefinedPath;
