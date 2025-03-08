import {
  ethers,
  Wallet,
  JsonRpcProvider,
  EtherscanProvider,
  Contract,
  formatEther,
  parseEther,
  parseUnits,
  formatUnits,
  isAddress,
  TransactionRequest,
  verifyMessage,
  HDNodeWallet,
  getDefaultProvider,
} from 'ethers';
import Constants from 'expo-constants';

import { AbstractWallet } from './abstract-wallet';
import { CryptoUnit, Chain } from '../../models/cryptoUnits';
import { Transaction } from './types/Transaction';

// type TransactionResponse = {
//   hash: string;
//   to?: string;
//   from: string;
//   nonce: number;
//   gasLimit: bigint;
//   gasPrice: bigint;
//   data: string;
//   value: bigint;
//   timestamp?: number;
//   confirmations?: number;
//   chainId: number;
//   wait: (confirmations?: number) => Promise<any>;
// };

export class EthereumWallet extends AbstractWallet {
  static readonly type: string = 'ethereum';
  static readonly typeReadable: string = 'Ethereum';
  public readonly type = EthereumWallet.type;
  public readonly typeReadable = EthereumWallet.typeReadable;

  _wallet: Wallet | null;
  _provider: JsonRpcProvider | EtherscanProvider | ReturnType<typeof getDefaultProvider> | null;
  _txs: Transaction[];

  constructor() {
    super();
    this._wallet = null;
    this._provider = null;
    this._txs = [];
    this.chain = Chain.ONCHAIN;
    this.preferredBalanceUnit = CryptoUnit.ETH;
  }

  /**
   * Generate a new Ethereum wallet
   */
  async generate(phrase?: string): Promise<void> {
    let wallet;
    if (!phrase) {
      wallet = Wallet.createRandom();
    } else {
      wallet = Wallet.fromPhrase(phrase);
    }
    // @ts-ignore should be there
    this.secret = wallet.mnemonic?.phrase;
    this._wallet = wallet;
    this._address = wallet.address;
  }

  /**
   * Import wallet from a private key
   */
  setSecret(privateKey: string): this {
    try {
      // Normalize private key format
      let normalizedKey = privateKey.trim();
      if (!normalizedKey.startsWith('0x')) {
        normalizedKey = '0x' + normalizedKey;
      }

      // Create wallet from private key
      const wallet = new Wallet(normalizedKey);
      this._wallet = wallet;
      this._address = wallet.address;
      this.secret = normalizedKey;

      return this;
    } catch (error) {
      console.error('Error setting Ethereum private key:', error);
      return this;
    }
  }

  /**
   * Connect to a provider
   * @param providerUrl Optional Ethereum node URL or etherScan API key. If not provided, uses environment variable
   */
  connectToProvider(providerUrl?: string): void {
    try {
      let provider;

      // If no provider URL is provided, try to use etherScan API key from environment
      if (!providerUrl) {
        const etherScanApiKey = Constants.expoConfig?.extra?.etherscanApiKey;
        if (!etherScanApiKey || etherScanApiKey === 'YOUR_API_KEY_HERE') {
          console.warn('No etherScan API key provided. Please set etherScan_API_KEY in your environment or app.config.ts');
          provider = getDefaultProvider();
        } else {
          provider = new EtherscanProvider('mainnet', etherScanApiKey);
        }
      } else if (providerUrl.startsWith('http')) {
        provider = new JsonRpcProvider(providerUrl);
      }

      if (!provider) {
        throw new Error('Ethereum - provider must be there');
      }
      this._provider = provider;

      // Connect wallet to provider if wallet exists
      if (this._wallet) {
        const isNotInstance = !(this._wallet instanceof Wallet);
        const phrase = this._wallet?.mnemonic?.phrase;
        if (isNotInstance && !!phrase) {
          this.generate(phrase);
        }
        this._wallet = this._wallet.connect(provider);
      }
    } catch (error) {
      console.error('Error connecting to Ethereum provider:', error);
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): string | false {
    return this._address;
  }

  /**
   * Get wallet balance in wei, but stored in a satoshi-like scale for consistent handling
   */
  async fetchBalance(): Promise<void> {
    if (!this._wallet) {
      throw new Error('Wallet not initialized ');
    }
    try {
      if (!this._provider) {
        await this.connectToProvider();
      }

      const address = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';
      // const address = this._wallet?.address
      // Get balance in wei
      const balance = await this._provider.getBalance(address);

      this.balance = Number(balance);

      this._lastBalanceFetch = +new Date();
    } catch (error) {
      console.error('Error fetching Ethereum balance:', error);
    }
  }

  /**
   * Override getBalance to ensure it returns the balance in satoshi-like scale
   * This makes it compatible with Bitcoin wallets for total balance calculation
   */
  getBalance(): number {
    return this.balance;
  }

  /**
   * Fetch transactions for the wallet using Etherscan API
   */
  async fetchTransactions(): Promise<void> {
    if (!this._wallet) {
      throw new Error('Wallet not initialized');
    }

    if (!this._provider) {
      this.connectToProvider();
    }

    try {
      // Access environment variables through expo-constants
      const etherscanApiKey = Constants.expoConfig?.extra?.etherscanApiKey || '';

      if (!etherscanApiKey || etherscanApiKey === 'YOUR_API_KEY_HERE') {
        console.warn('No Etherscan API key provided. Please set ETHERSCAN_API_KEY in your environment or app.config.ts');
      }

      // const walletAddress = this._wallet.address;
      const walletAddress = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';

      // Determine which Etherscan API URL to use based on the provider's network
      let networkName = 'mainnet';
      let apiBaseUrl = 'https://api.etherscan.io/api';

      if (this._provider) {
        const network = await this._provider.getNetwork();
        const chainId = Number(network.chainId);

        // Set network name and API URL based on chain ID
        switch (chainId) {
          case 1: // Mainnet
            networkName = 'mainnet';
            apiBaseUrl = 'https://api.etherscan.io/api';
            break;
          case 5: // Goerli
            networkName = 'goerli';
            apiBaseUrl = 'https://api-goerli.etherscan.io/api';
            break;
          case 11155111: // Sepolia
            networkName = 'sepolia';
            apiBaseUrl = 'https://api-sepolia.etherscan.io/api';
            break;
          case 42161: // Arbitrum
            networkName = 'arbitrum';
            apiBaseUrl = 'https://api.arbiscan.io/api';
            break;
          case 137: // Polygon
            networkName = 'polygon';
            apiBaseUrl = 'https://api.polygonscan.com/api';
            break;
          default:
            console.warn(`Network with chain ID ${chainId} not recognized, using mainnet Etherscan API`);
        }
      }

      // Fetch normal transactions
      const normalTxUrl = `${apiBaseUrl}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`;
      const normalTxResponse = await fetch(normalTxUrl);
      const normalTxData = await normalTxResponse.json();

      // Fetch internal transactions (ETH transfers created by contracts)
      // const internalTxUrl = `${apiBaseUrl}?module=account&action=txlistinternal&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`;
      // const internalTxResponse = await fetch(internalTxUrl);
      // const internalTxData = await internalTxResponse.json();

      // Combine normal and internal transactions
      const combinedTxs = [];

      if (normalTxData.status === '1' && Array.isArray(normalTxData.result)) {
        combinedTxs.push(...normalTxData.result);
      }

      // if (internalTxData.status === '1' && Array.isArray(internalTxData.result)) {
      //   // For internal transactions, we need to differentiate them from normal transactions
      //   const internalTxs = internalTxData.result.map((tx: any) => ({
      //     ...tx,
      //     isInternal: true,
      //   }));
      //   combinedTxs.push(...internalTxs);
      // }

      // Sort combined transactions by timestamp (descending)
      combinedTxs.sort((a: any, b: any) => Number(b.timeStamp) - Number(a.timeStamp));

      // Map Etherscan data to our transaction format
      this._txs = combinedTxs.map((tx: any) => {
        const isReceived = tx.to?.toLowerCase() === walletAddress.toLowerCase();
        const valueEth = tx.value; // wei

        // For fees, we can only calculate for transactions we sent (not for received transactions)
        let fee = 0;
        if (!isReceived && !tx.isInternal && tx.gasUsed && tx.gasPrice) {
          fee = tx.gasUsed * tx.gasPrice; // wei
        }

        // Determine transaction status
        let status = 'confirmed';
        if (tx.isError === '1') {
          status = 'failed';
        } else if (!tx.blockNumber || tx.blockNumber === '0') {
          status = 'pending';
        }

        return {
          txid: tx.hash,
          hash: tx.hash,
          value: isReceived ? valueEth : -valueEth,
          received: new Date(Number(tx.timeStamp) * 1000).toString(),
          confirmations: tx.confirmations || (tx.isInternal ? 0 : Number(tx.confirmations) || 0),
          fee,
          inputs: [],
          outputs: [],
          time: Number(tx.timeStamp),
          blockNumber: Number(tx.blockNumber),
          isInternal: !!tx.isInternal,
          isError: tx.isError === '1',
          network: networkName,
          // Mark this transaction as an Ethereum transaction
          isEthereum: true,
          status,
          gasPrice: tx.gasPrice,
          gasUsed: tx.gasUsed,
          nonce: Number(tx.nonce) || 0,
        };
      });

      this._lastTxFetch = +new Date();
    } catch (error) {
      console.error('Error fetching Ethereum transactions:', error);
    }
  }

  /**
   * Get transactions
   */
  getTransactions(): Transaction[] {
    return this._txs;
  }

  /**
   * Send ETH transaction
   * @param toAddress Recipient address
   * @param amount Amount in ETH
   * @param gasPrice Gas price in gwei (optional)
   * @param gasLimit Gas limit (optional)
   */
  async sendTransaction(toAddress: string, amount: number, gasPrice?: number, gasLimit: bigint = BigInt(21000)): Promise<string> {
    if (!this._wallet || !this._provider) {
      throw new Error('Wallet not initialized or not connected to provider');
    }

    try {
      // Convert amount from ETH to wei
      const valueWei = parseEther(amount.toString());

      // Create transaction object
      const tx: TransactionRequest = {
        to: toAddress,
        value: valueWei,
        gasLimit,
      };

      // Set gas price if provided
      if (gasPrice) {
        tx.gasPrice = parseUnits(gasPrice.toString(), 'gwei');
      }

      // Send transaction
      const transaction = await this._wallet.sendTransaction(tx);

      // Wait for transaction to be mined
      await transaction.wait();

      return transaction.hash;
    } catch (error) {
      console.error('Error sending Ethereum transaction:', error);
      throw error;
    }
  }

  /**
   * Sign a message using the Ethereum wallet
   * @param message Message to sign
   */
  async signMessage(message: string): Promise<string> {
    if (!this._wallet) {
      throw new Error('Wallet not initialized');
    }

    return await this._wallet.signMessage(message);
  }

  /**
   * Verify a signed message
   * @param message Original message
   * @param signature Signature
   * @param address Address that supposedly signed the message
   */
  static verifyMessage(message: string, signature: string, address: string): boolean {
    try {
      const recoveredAddress = verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying Ethereum message:', error);
      return false;
    }
  }

  /**
   * Check if address is valid Ethereum address
   * @param address Ethereum address to validate
   */
  isAddressValid(address: string): boolean {
    return isAddress(address);
  }

  /**
   * Check if we own the address
   * @param address Ethereum address to check
   */
  weOwnAddress(address: string): boolean {
    if (!this._wallet || !address) return false;
    return this._wallet.address.toLowerCase() === address.toLowerCase();
  }

  /**
   * Check if a transaction belongs to this wallet
   * @param txid Transaction hash
   */
  weOwnTransaction(txid: string): boolean {
    return this._txs.some(tx => tx.txid === txid);
  }

  /**
   * Override behavior - ETH wallets can send
   */
  allowSend(): boolean {
    return !!this._wallet && !!this._provider;
  }

  /**
   * Override behavior - ETH wallets can receive
   */
  allowReceive(): boolean {
    return !!this._wallet;
  }

  /**
   * Override behavior - Ethereum uses its own signing methods
   */
  allowSignVerifyMessage(): boolean {
    return !!this._wallet;
  }

  /**
   * Get recovery phrase from a mnemonic wallet
   * Note: This only works if wallet was created with mnemonic
   */
  getMnemonic(): string | null {
    if (!this._wallet) {
      return null;
    }

    // In ethers v6, mnemonic is available if the wallet is an HDNodeWallet
    if (this._wallet instanceof HDNodeWallet && this._wallet.mnemonic) {
      return this._wallet.mnemonic.phrase;
    }

    return null;
  }

  /**
   * Create wallet from mnemonic
   * @param mnemonic Mnemonic phrase
   * @param path Derivation path (optional)
   */
  static fromMnemonic(mnemonic: string, path?: string): EthereumWallet {
    // In ethers v6, we use HDNodeWallet.fromMnemonic
    const hdNode = HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonic));
    const derivedNode = path ? hdNode.derivePath(path) : hdNode;

    const ethereumWallet = new EthereumWallet();
    ethereumWallet.setSecret(derivedNode.privateKey);
    return ethereumWallet;
  }

  /**
   * Get ERC20 token balance
   * @param tokenAddress ERC20 token contract address
   */
  async getTokenBalance(tokenAddress: string): Promise<string> {
    if (!this._wallet || !this._provider) {
      throw new Error('Wallet not initialized or not connected to provider');
    }

    // ERC20 ABI for balanceOf function
    const abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
    ];

    // Create contract instance
    const contract = new Contract(tokenAddress, abi, this._provider);

    // Get token details
    const balance = await contract.balanceOf(this._wallet.address);
    const decimals = await contract.decimals();

    // Format balance according to token decimals
    return formatUnits(balance, decimals);
  }

  /**
   * Send ERC20 tokens
   * @param tokenAddress ERC20 token contract address
   * @param toAddress Recipient address
   * @param amount Amount of tokens to send
   */
  async sendToken(tokenAddress: string, toAddress: string, amount: string): Promise<string> {
    if (!this._wallet || !this._provider) {
      throw new Error('Wallet not initialized or not connected to provider');
    }

    // ERC20 ABI for transfer function
    const abi = ['function transfer(address to, uint amount) returns (bool)', 'function decimals() view returns (uint8)'];

    // Create contract instance with wallet signer
    const contract = new Contract(tokenAddress, abi, this._wallet);

    // Get token decimals
    const decimals = await contract.decimals();

    // Format amount according to token decimals
    const parsedAmount = parseUnits(amount, decimals);

    // Send transaction
    const tx = await contract.transfer(toAddress, parsedAmount);

    // Wait for transaction to be mined
    await tx.wait();

    return tx.hash;
  }

  getPreferredBalanceUnit(): CryptoUnit {
    return this.preferredBalanceUnit;
  }
}
