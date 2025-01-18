import React from 'react';
import { InputAccessoryView, Keyboard, Platform, StyleSheet, View } from 'react-native';
import { BlueButtonLink } from '../BlueComponents';
import loc from '../loc';
import { useTheme } from './themes';
import * as Clipboard from 'expo-clipboard';

interface DoneAndDismissKeyboardInputAccessoryProps {
  onPasteTapped: (clipboard: string) => void;
  onClearTapped: () => void;
}
export const DoneAndDismissKeyboardInputAccessoryViewID = 'DoneAndDismissKeyboardInputAccessory';
export const DoneAndDismissKeyboardInputAccessory: React.FC<DoneAndDismissKeyboardInputAccessoryProps> = props => {
  const { colors } = useTheme();

  const styleHooks = StyleSheet.create({
    container: {
      backgroundColor: colors.inputBackgroundColor,
    },
  });

  const onPasteTapped = async () => {
    const clipboard = await Clipboard.getStringAsync();
    props.onPasteTapped(clipboard);
  };

  const inputView = (
    <View style={[styles.container, styleHooks.container]}>
      <BlueButtonLink title={loc.send.input_clear} onPress={props.onClearTapped} />
      <BlueButtonLink title={loc.send.input_paste} onPress={onPasteTapped} />
      <BlueButtonLink title={loc.send.input_done} onPress={Keyboard.dismiss} />
    </View>
  );

  if (Platform.OS === 'ios') {
    return <InputAccessoryView nativeID={DoneAndDismissKeyboardInputAccessoryViewID}>{inputView}</InputAccessoryView>;
  } else {
    return inputView;
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    maxHeight: 44,
  },
});
