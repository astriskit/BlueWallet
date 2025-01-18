import { router, useNavigationContainerRef } from 'expo-router';

let navRef: ReturnType<typeof useNavigationContainerRef>['current'];

const setNavigationRef = (ref: typeof navRef) => {
  navRef = ref;
};
const navigationRef = () => {
  return navRef;
};

export { navigationRef, setNavigationRef };

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
