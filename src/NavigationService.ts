import { router } from 'expo-router';

export function navigateToWalletsList() {
  router.navigate({ pathname: '/WalletsList' });
}

export function reset() {
  router.dismissTo('/UnlockWithScreen');
}

export function popToTop() {
  router.dismissAll();
}

export function pop() {
  router.dismiss();
}

export type RouterParam = Parameters<typeof router.navigate>[0];
export * from 'expo-router';
