import React, { lazy, Suspense } from 'react';
import { useStorage } from '../hooks/context/useStorage';
import DevMenu from '../components/DevMenu';
const CompanionDelegates = lazy(() => import('../components/CompanionDelegates'));

const MasterView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletsInitialized } = useStorage();

  return (
    <>
      {children}
      {walletsInitialized && (
        <Suspense>
          <CompanionDelegates />
        </Suspense>
      )}
      {__DEV__ && <DevMenu />}
    </>
  );
};

export default MasterView;
