import { currentPeerIndex } from './client';
import { hardcodedPeers } from './suggestedServers';

export function getCurrentPeer() {
  return hardcodedPeers[currentPeerIndex()];
}
