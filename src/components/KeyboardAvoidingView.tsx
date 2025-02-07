import React from 'react';

import { KeyboardAwareScrollView, KeyboardAwareScrollViewProps } from 'react-native-keyboard-aware-scroll-view';

type Props = React.PropsWithChildren & {};

export const KeyboardAvoidingView: React.FC<Props> = props => {
  const wrapperProps: KeyboardAwareScrollViewProps = {
    enableOnAndroid: true,
  };

  return <KeyboardAwareScrollView {...wrapperProps}>{props.children}</KeyboardAwareScrollView>;
};
