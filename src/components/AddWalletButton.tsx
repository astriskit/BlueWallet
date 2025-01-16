import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { Icon } from '@rneui/themed';
import { useTheme } from './themes';
import ToolTipMenu from './TooltipMenu';
import { CommonToolTipActions } from '../typings/CommonToolTipActions';
import loc from '../loc';
import { router } from '../NavigationService';
import { useExtendedNavigation } from '../hooks/useExtendedNavigation';

type AddWalletButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
};

const styles = StyleSheet.create({
  ball: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignContent: 'center',
  },
});

const AddWalletButton: React.FC<AddWalletButtonProps> = () => {
  const { colors } = useTheme();

  const { navigate } = useExtendedNavigation();

  const navigateToAddWallet = useCallback(() => {
    navigate('AddWalletRoot');
  }, [navigate]);

  const onPressMenuItem = useCallback((action: string) => {
    switch (action) {
      case CommonToolTipActions.ImportWallet.id:
        router.navigate('/AddWalletRoot/ImportWallet');
        break;
      default:
        break;
    }
  }, []);

  const actions = useMemo(() => [CommonToolTipActions.ImportWallet], []);

  return (
    <ToolTipMenu accessibilityRole="button" accessibilityLabel={loc.wallets.add_title} onPressMenuItem={onPressMenuItem} actions={actions}>
      <TouchableOpacity
        style={[
          styles.ball,
          {
            backgroundColor: colors.buttonBackgroundColor,
          },
        ]}
        onPress={navigateToAddWallet}
      >
        <Icon name="add" size={22} type="ionicons" color={colors.foregroundColor} />
      </TouchableOpacity>
    </ToolTipMenu>
  );
};

export default AddWalletButton;
