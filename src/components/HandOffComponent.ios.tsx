import React from 'react';

// @ts-ignore: Handoff is not typed
import Handoff from 'react-native-handoff';
import { useSettings } from '../hooks/context/useSettings';
import { HandOffComponentProps } from './types';

const HandOffComponent: React.FC<HandOffComponentProps> = props => {
  const { isHandOffUseEnabled } = useSettings();
  console.debug('HandOffComponent is rendering.');
  return isHandOffUseEnabled ? <Handoff {...props} /> : null;
};

const MemoizedHandOffComponent = React.memo(HandOffComponent);

export default MemoizedHandOffComponent;
