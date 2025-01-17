import DefaultPreference from 'react-native-default-preference';
import { GROUP_IO_BLUEWALLET } from '../currency';
import { getNextPeer } from './getNextPeer';
import { getSavedPeer } from './getSavedPeer';
import { isDisabled } from './isDisabled';
import { getCurrentPeer } from './getCurrentPeer';
import { ELECTRUM_HOST, ELECTRUM_SSL_PORT, ELECTRUM_TCP_PORT, ElectrumClient, net, tls } from './constants';
import { connectionAttempt, mainClient, mainConnected, latestBlock, disableBatching, serverName, wasConnectedAtLeastOnce } from './client';
import { semVerToInt } from './semVerToInt';

import { Peer } from './types';
import presentAlert from '../../components/Alert';
import loc from '../../loc';
import { presentResetToDefaultsAlert } from './presentResetToDefaultsAlert';

export async function connectMain(): Promise<void> {
  if (await isDisabled()) {
    console.log('Electrum connection disabled by user. Skipping connectMain call');
    return;
  }
  let usingPeer = getNextPeer();
  const savedPeer = await getSavedPeer();
  if (savedPeer && savedPeer.host && (savedPeer.tcp || savedPeer.ssl)) {
    usingPeer = savedPeer;
  }

  console.log('Using peer:', JSON.stringify(usingPeer));

  await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
  try {
    if (usingPeer.host.endsWith('onion')) {
      const randomPeer = getCurrentPeer();
      await DefaultPreference.set(ELECTRUM_HOST, randomPeer.host);
      await DefaultPreference.set(ELECTRUM_TCP_PORT, randomPeer.tcp ?? '');
      await DefaultPreference.set(ELECTRUM_SSL_PORT, randomPeer.ssl ?? '');
    }
  } catch (e) {
    // Must be running on Android
    console.log(e);
  }

  try {
    console.log('begin connection:', JSON.stringify(usingPeer));
    mainClient(new ElectrumClient(net, tls, usingPeer.ssl || usingPeer.tcp, usingPeer.host, usingPeer.ssl ? 'tls' : 'tcp'));

    mainClient().onError = function (e: { message: string }) {
      console.log('electrum mainClient.onError():', e.message);
      if (mainConnected()) {
        // most likely got a timeout from electrum ping. lets reconnect
        // but only if we were previously connected (mainConnected), otherwise theres other
        // code which does connection retries
        mainClient().close();
        mainConnected(false);
        // dropping `mainConnected` flag ensures there wont be reconnection race condition if several
        // errors triggered
        console.log('reconnecting after socket error');
        setTimeout(connectMain, usingPeer.host.endsWith('.onion') ? 4000 : 500);
      }
    };
    const ver = await mainClient().initElectrum({ client: 'bluewallet', version: '1.4' });
    if (ver && ver[0]) {
      console.log('connected to ', ver);
      serverName(ver[0]);
      mainConnected(true);
      wasConnectedAtLeastOnce(true);
      if (ver[0].startsWith('ElectrumPersonalServer') || ver[0].startsWith('electrs') || ver[0].startsWith('Fulcrum')) {
        disableBatching(true);

        // exeptions for versions:
        const [electrumImplementation, electrumVersion] = ver[0].split(' ');
        switch (electrumImplementation) {
          case 'electrs':
            if (semVerToInt(electrumVersion) >= semVerToInt('0.9.0')) {
              disableBatching(false);
            }
            break;
          case 'electrs-esplora':
            // its a different one, and it does NOT support batching
            // nop
            break;
          case 'Fulcrum':
            if (semVerToInt(electrumVersion) >= semVerToInt('1.9.0')) {
              disableBatching(false);
            }
            break;
        }
      }
      const header = await mainClient().blockchainHeaders_subscribe();
      if (header && header.height) {
        latestBlock({
          height: header.height,
          time: Math.floor(+new Date() / 1000),
        });
      }
      // AsyncStorage.setItem(storageKey, JSON.stringify(peers));  TODO: refactor
    }
  } catch (e) {
    mainConnected(false);
    console.log('bad connection:', JSON.stringify(usingPeer), e);
  }

  if (!mainConnected) {
    console.log('retry');
    connectionAttempt(connectionAttempt() + 1);
    mainClient()?.close?.();
    if (connectionAttempt() >= 5) {
      presentNetworkErrorAlert(usingPeer);
    } else {
      console.log('reconnection attempt #', connectionAttempt);
      await new Promise(resolve => setTimeout(resolve, 500)); // sleep
      return connectMain();
    }
  }
}

export const presentNetworkErrorAlert = async (usingPeer?: Peer) => {
  if (await isDisabled()) {
    console.log(
      'Electrum connection disabled by user. Perhaps we are attempting to show this network error alert after the user disabled connections.',
    );
    return;
  }

  presentAlert({
    allowRepeat: false,
    title: loc.errors.network,
    message: loc.formatString(
      usingPeer ? loc.settings.electrum_unable_to_connect : loc.settings.electrum_error_connect,
      usingPeer ? { server: `${usingPeer.host}:${usingPeer.ssl ?? usingPeer.tcp}` } : {},
    ),
    buttons: [
      {
        text: loc.wallets.list_tryagain,
        onPress: () => {
          connectionAttempt(0);
          mainClient()?.close?.();
          setTimeout(connectMain, 500);
        },
        style: 'default',
      },
      {
        text: loc.settings.electrum_reset,
        onPress: () => {
          presentResetToDefaultsAlert().then(result => {
            if (result) {
              connectionAttempt(0);
              mainClient()?.close?.();
              setTimeout(connectMain, 500);
            }
          });
        },
        style: 'destructive',
      },
      {
        text: loc._.cancel,
        onPress: () => {
          connectionAttempt(0);
          mainClient()?.close?.();
        },
        style: 'cancel',
      },
    ],
    options: { cancelable: false },
  });
};
