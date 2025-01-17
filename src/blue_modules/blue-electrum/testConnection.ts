import { ElectrumClient, net, tls } from './constants';

/**
 * @returns {Promise<boolean>} Whether provided host:port is a valid electrum server
 */
export const testConnection = async function (host: string, tcpPort?: number, sslPort?: number): Promise<boolean> {
  const client = new ElectrumClient(net, tls, sslPort || tcpPort, host, sslPort ? 'tls' : 'tcp');

  client.onError = () => {}; // mute
  let timeoutId: NodeJS.Timeout | undefined;
  try {
    const rez = await Promise.race([
      new Promise(resolve => {
        timeoutId = setTimeout(() => resolve('timeout'), 5000);
      }),
      client.connect(),
    ]);
    if (rez === 'timeout') return false;

    await client.server_version('2.7.11', '1.4');
    await client.server_ping();
    return true;
  } catch (_) {
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    client.close();
  }

  return false;
};
