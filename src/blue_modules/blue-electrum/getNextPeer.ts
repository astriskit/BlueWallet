import { currentPeerIndex } from './client';
import { getCurrentPeer } from './getCurrentPeer';
import { hardcodedPeers } from './suggestedServers';

/**
 * Returns NEXT hardcoded electrum server (increments index after use)
 */
export function getNextPeer() {
  const peer = getCurrentPeer();
  currentPeerIndex(currentPeerIndex() + 1);
  if (currentPeerIndex() + 1 >= hardcodedPeers.length) currentPeerIndex(0);
  return peer;
}
