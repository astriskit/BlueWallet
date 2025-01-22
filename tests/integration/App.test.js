import assert from 'assert';
import React from 'react';
import * as TestRenderer from '@testing-library/react-native';

import '../mocks/react-reanimated';

import { Header } from '../../src/components/Header';
import SelfTest from '../../src/screen/settings/SelfTest';
import Settings from '../../src/screen/settings/Settings';

import { BlueDefaultTheme as MockTheme } from '../fixtures/Theme';

jest.mock('expo-router', () => {
  return {
    router: {
      navigate: jest.fn(),
      dismissTo: jest.fn(),
      dismissAll: jest.fn(),
      dismiss: jest.fn(),
    },
    useNavigationContainerRef: jest.fn(() => {
      return { current: '' };
    }),
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    DefaultTheme: { colors: {} },
    DarkTheme: { colors: {} },
    useTheme: () => MockTheme,
  };
});

jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
  __esModule: true,
  default: {
    ignoreLogs: jest.fn(),
    ignoreAllLogs: jest.fn(),
  },
}));

jest.mock('../../src/blue_modules/BlueElectrum', () => {
  return {
    connectMain: jest.fn(),
  };
});

it('Header works', () => {
  const rendered = TestRenderer.render(<Header />).toJSON();
  expect(rendered).toBeTruthy();
});

// eslint-disable-next-line jest/no-disabled-tests
it.skip('Settings work', () => {
  const rendered = TestRenderer.render(<Settings />).toJSON();
  expect(rendered).toBeTruthy();
});

it('SelfTest work', () => {
  const component = TestRenderer.render(<SelfTest />);
  const root = component.root;
  const rendered = component.toJSON();
  expect(rendered).toBeTruthy();
  // console.log((root.findAllByType('Text')[0].props));

  let okFound = false;
  const allTests = [];
  for (const v of root.findAllByType('Text')) {
    let text = v.props.children;
    if (text.join) {
      text = text.join('');
    }
    if (text === 'OK') {
      okFound = true;
    }
    allTests.push(text);
    // console.log(text);
  }

  assert.ok(okFound, 'OK not found. Got: ' + allTests.join('; '));
});
