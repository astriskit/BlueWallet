import { EthereumWallet } from '../../src/class/wallets/ethereum-wallet';
import { HDNodeWallet } from 'ethers';

// Mock ethers.js functionality for testing
jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers');

  // Create a mock wallet for testing
  const mockWallet = {
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    privateKey: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    connect: jest.fn().mockReturnThis(),
    signMessage: jest.fn().mockResolvedValue('0xSignature'),
    mnemonic: { phrase: 'test test test test test test test test test test test junk' },
  };

  return {
    ...actualEthers,
    isAddress: (address: string) => {
      return /^0x[0-9a-fA-F]{40}$/.test(address);
    },
    Wallet: {
      createRandom: jest.fn().mockReturnValue(mockWallet),
      __esModule: true,
    },
    HDNodeWallet: {
      fromMnemonic: jest.fn().mockReturnValue({
        ...mockWallet,
        derivePath: jest.fn().mockReturnThis(),
      }),
      __esModule: true,
    },
    Mnemonic: {
      fromPhrase: jest.fn().mockReturnValue({ phrase: 'test test test test test test test test test test test junk' }),
    },
  };
});

describe('EthereumWallet', () => {
  let wallet: EthereumWallet;

  beforeEach(() => {
    wallet = new EthereumWallet();
  });

  test('should have correct type', () => {
    expect(wallet.type).toBe('ethereum');
    expect(wallet.typeReadable).toBe('Ethereum');
  });

  test('should validate Ethereum addresses', () => {
    // Valid addresses
    expect(wallet.isAddressValid('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')).toBe(true);
    expect(wallet.isAddressValid('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')).toBe(true); // WETH contract

    // Invalid addresses
    expect(wallet.isAddressValid('0x71C7656EC7ab88b098defB751B7401B5f6d8976')).toBe(false); // too short
    expect(wallet.isAddressValid('0x71C7656EC7ab88b098defB751B7401B5f6d8976FG')).toBe(false); // invalid character
    expect(wallet.isAddressValid('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(false); // Bitcoin address
  });

  test('should set private key correctly', () => {
    // Test private key (don't use this in production, it's for testing only)
    const privateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    wallet.setSecret(privateKey);

    expect(wallet.getSecret()).toBe(privateKey);
    expect(wallet.getAddress()).toBeTruthy();
  });

  test('should create wallet from mnemonic', async () => {
    // Test mnemonic (don't use this in production, it's for testing only)
    const mnemonic = 'test test test test test test test test test test test junk';
    const ethWallet = EthereumWallet.fromMnemonic(mnemonic);

    expect(ethWallet.getAddress()).toBeTruthy();
  });

  test('should handle various Ethereum addresses correctly', () => {
    const privateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    wallet.setSecret(privateKey);
    const address = wallet.getAddress() as string;

    // Test weOwnAddress
    expect(wallet.weOwnAddress(address)).toBe(true);
    expect(wallet.weOwnAddress(address.toUpperCase())).toBe(true); // Ethereum addresses are case-insensitive
    expect(wallet.weOwnAddress('0x1234567890123456789012345678901234567890')).toBe(false);
  });

  test('should allow signing and verification of messages', async () => {
    const privateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    wallet.setSecret(privateKey);

    // In a real scenario, we'd test the actual signing and verification
    expect(wallet.allowSignVerifyMessage()).toBe(true);
  });

  test('should properly convert between ETH and satoshi-like units', () => {
    wallet.balance = 1e8; // 1 ETH in satoshi-like units
    expect(wallet.getEthBalance()).toBe(1);

    wallet.balance = 0.5e8; // 0.5 ETH in satoshi-like units
    expect(wallet.getEthBalance()).toBe(0.5);
  });

  test('should generate a new wallet', async () => {
    await wallet.generate();
    expect(wallet.getSecret()).toBeTruthy();
    expect(wallet.getAddress()).toBeTruthy();
  });

  test('should get mnemonic if wallet was created with one', () => {
    // Create a wallet from mnemonic
    const mnemonic = 'test test test test test test test test test test test junk';
    const ethWallet = EthereumWallet.fromMnemonic(mnemonic);

    // Mock the internal wallet to simulate an HD wallet with mnemonic
    (ethWallet._wallet as any) = {
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      mnemonic: { phrase: mnemonic },
    };
    Object.setPrototypeOf(ethWallet._wallet, HDNodeWallet.prototype);

    expect(ethWallet.getMnemonic()).toBe(mnemonic);
  });
});
