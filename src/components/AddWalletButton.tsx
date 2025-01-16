import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import { useTheme } from './themes';
import ToolTipMenu from './TooltipMenu';
import { CommonToolTipActions } from '../typings/CommonToolTipActions';
import loc from '../loc';
import { router } from '../NavigationService';
import { useExtendedNavigation } from '../hooks/useExtendedNavigation';

const styles = StyleSheet.create({
  ball: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignContent: 'center',
  },
});

const AddWalletButton: React.FC = () => {
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
    <TouchableOpacity
      style={[
        styles.ball,
        {
          backgroundColor: colors.buttonBackgroundColor,
        },
      ]}
      onPress={navigateToAddWallet}
    >
      <ToolTipMenu
        accessibilityRole="button"
        accessibilityLabel={loc.wallets.add_title}
        onPressMenuItem={onPressMenuItem}
        actions={actions}
      >
        <Icon name="add" size={22} type="ionicons" color={colors.foregroundColor} />
      </ToolTipMenu>
    </TouchableOpacity>
  );
};

export default AddWalletButton;
