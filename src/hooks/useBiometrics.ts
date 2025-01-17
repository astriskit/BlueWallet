import { useState, useEffect, useCallback } from 'react';

import { BiometryTypes as RNBiometryTypes } from 'react-native-biometrics';
import { useStorage } from './context/useStorage';
import { clearKeychain, rnBiometrics, STORAGEKEY } from './utils/biometrics';

const FaceID = 'Face ID';
const TouchID = 'Touch ID';
const Biometrics = 'Biometrics';

const useBiometrics = () => {
  const { getItem, setItem } = useStorage();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [deviceBiometricType, setDeviceBiometricType] = useState<'TouchID' | 'FaceID' | 'Biometrics' | undefined>(undefined);

  useEffect(() => {
    const fetchBiometricEnabledStatus = async () => {
      const enabled = await isBiometricUseEnabled();
      setBiometricEnabled(enabled);

      const biometricType = await type();
      setDeviceBiometricType(biometricType);
    };

    fetchBiometricEnabledStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDeviceBiometricCapable = useCallback(async () => {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      return available;
    } catch (e) {
      console.debug('Biometrics isDeviceBiometricCapable failed');
      console.debug(e);
      setBiometricUseEnabled(false);
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const type = useCallback(async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (!available) {
        return undefined;
      }

      return biometryType;
    } catch (e) {
      console.debug('Biometrics biometricType failed');
      console.debug(e);
      return undefined;
    }
  }, []);

  const isBiometricUseEnabled = useCallback(async () => {
    try {
      const enabledBiometrics = await getItem(STORAGEKEY);
      return !!enabledBiometrics;
    } catch (_) {}

    return false;
  }, [getItem]);

  const isBiometricUseCapableAndEnabled = useCallback(async () => {
    const isEnabled = await isBiometricUseEnabled();
    const isCapable = await isDeviceBiometricCapable();
    return isEnabled && isCapable;
  }, [isBiometricUseEnabled, isDeviceBiometricCapable]);

  const setBiometricUseEnabled = useCallback(
    async (value: boolean) => {
      await setItem(STORAGEKEY, value === true ? '1' : '');
      setBiometricEnabled(value);
    },
    [setItem],
  );

  return {
    isDeviceBiometricCapable,
    deviceBiometricType,
    isBiometricUseEnabled,
    isBiometricUseCapableAndEnabled,
    setBiometricUseEnabled,
    clearKeychain,
    biometricEnabled,
  };
};

export { FaceID, TouchID, Biometrics, RNBiometryTypes as BiometricType, useBiometrics };
