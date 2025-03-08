import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { EthereumWallet } from '../../class/wallets/ethereum-wallet';

const EthereumWalletExample: React.FC = () => {
  const [wallet, setWallet] = useState<EthereumWallet | null>(null);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [gasPrice, setGasPrice] = useState<string>('50'); // Default 50 gwei
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');

  // Initialize wallet from private key
  const initializeWallet = async () => {
    try {
      setIsLoading(true);
      const newWallet = new EthereumWallet();

      if (privateKey.trim() !== '') {
        newWallet.setSecret(privateKey);
        // Connect to provider using environment variables or passed Infura API key
        newWallet.connectToProvider();

        const walletAddress = newWallet.getAddress();
        if (walletAddress) {
          setAddress(walletAddress);

          // Fetch balance
          await newWallet.fetchBalance();
          setBalance(newWallet.getBalance().toString());

          // Fetch transactions
          await newWallet.fetchTransactions();
        }

        setWallet(newWallet);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize wallet: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new random wallet
  const createNewWallet = async () => {
    try {
      setIsLoading(true);
      const newWallet = new EthereumWallet();
      await newWallet.generate();
      // Connect to provider using environment variables
      newWallet.connectToProvider();

      const walletAddress = newWallet.getAddress();
      if (walletAddress) {
        setAddress(walletAddress);
        setPrivateKey(newWallet.getSecret());

        // Fetch balance
        await newWallet.fetchBalance();
        setBalance(newWallet.getBalance().toString());

        // Fetch transactions (will be empty for new wallet)
        await newWallet.fetchTransactions();
      }

      setWallet(newWallet);
      Alert.alert('Wallet Created', 'New Ethereum wallet created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create wallet: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Send ETH transaction
  const sendTransaction = async () => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not initialized');
      return;
    }

    if (!destinationAddress || !amount) {
      Alert.alert('Error', 'Please enter destination address and amount');
      return;
    }

    if (!wallet.isAddressValid(destinationAddress)) {
      Alert.alert('Error', 'Invalid destination address');
      return;
    }

    try {
      setIsLoading(true);
      // Convert gasLimit to BigInt for ethers v6
      const gasLimitBigInt = BigInt(21000); // Default gas limit

      const txHash = await wallet.sendTransaction(destinationAddress, parseFloat(amount), parseFloat(gasPrice), gasLimitBigInt);

      setTxHash(txHash);
      Alert.alert('Success', `Transaction sent! Hash: ${txHash}`);

      // Refresh balance
      await wallet.fetchBalance();
      setBalance(wallet.getEthBalance().toString());
    } catch (error) {
      Alert.alert('Error', 'Failed to send transaction: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get ERC20 token balance
  const getTokenBalance = async () => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not initialized');
      return;
    }

    if (!tokenAddress || !wallet.isAddressValid(tokenAddress)) {
      Alert.alert('Error', 'Invalid token address');
      return;
    }

    try {
      setIsLoading(true);
      const balance = await wallet.getTokenBalance(tokenAddress);
      setTokenBalance(balance);
    } catch (error) {
      Alert.alert('Error', 'Failed to get token balance: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ethereum Wallet Example</Text>

      {/* Wallet Initialization */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter private key (0x...)"
          value={privateKey}
          onChangeText={setPrivateKey}
          secureTextEntry
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={initializeWallet} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Load Wallet'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={createNewWallet} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Create New'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wallet Info */}
      {wallet && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Info</Text>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value} selectable>
            {address}
          </Text>

          <Text style={styles.label}>Balance:</Text>
          <Text style={styles.value}>{balance} ETH</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              setIsLoading(true);
              try {
                await wallet.fetchTransactions();
                await wallet.fetchBalance();
                setBalance(wallet.getBalance().toString());
              } catch (error) {
                Alert.alert('Error', 'Failed to refresh: ' + (error as Error).message);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Refreshing...' : 'Refresh Balance & Transactions'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transactions List */}
      {wallet && wallet.getTransactions().length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {wallet
            .getTransactions()
            .slice(0, 5)
            .map((tx, index) => (
              <View key={index} style={styles.transaction}>
                <Text style={styles.label}>Hash:</Text>
                <Text style={styles.value} selectable>
                  {tx.hash}
                </Text>

                <Text style={styles.label}>Value:</Text>
                <Text style={[styles.value, tx.value > 0 ? styles.incoming : styles.outgoing]}>
                  {tx.value > 0 ? '+' : ''}
                  {(tx.value / 1e8).toFixed(6)} ETH
                </Text>

                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{new Date(tx.received || 0).toLocaleString()}</Text>

                <Text style={styles.label}>Confirmations:</Text>
                <Text style={styles.value}>{tx.confirmations || 0}</Text>

                {tx.isInternal && <Text style={styles.badge}>Internal Transaction</Text>}

                {tx.isError && <Text style={[styles.badge, styles.errorBadge]}>Failed</Text>}
              </View>
            ))}
        </View>
      )}

      {/* Send Transaction */}
      {wallet && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send ETH</Text>

          <TextInput
            style={styles.input}
            placeholder="Destination address (0x...)"
            value={destinationAddress}
            onChangeText={setDestinationAddress}
          />

          <TextInput style={styles.input} placeholder="Amount (ETH)" value={amount} onChangeText={setAmount} keyboardType="numeric" />

          <TextInput
            style={styles.input}
            placeholder="Gas price (gwei)"
            value={gasPrice}
            onChangeText={setGasPrice}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.button} onPress={sendTransaction} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? 'Sending...' : 'Send Transaction'}</Text>
          </TouchableOpacity>

          {txHash !== '' && (
            <View>
              <Text style={styles.label}>Transaction Hash:</Text>
              <Text style={styles.value} selectable>
                {txHash}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ERC20 Tokens */}
      {wallet && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ERC20 Tokens</Text>

          <TextInput
            style={styles.input}
            placeholder="Token contract address (0x...)"
            value={tokenAddress}
            onChangeText={setTokenAddress}
          />

          <TouchableOpacity style={styles.button} onPress={getTokenBalance} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Get Token Balance'}</Text>
          </TouchableOpacity>

          {tokenBalance !== '0' && (
            <View>
              <Text style={styles.label}>Token Balance:</Text>
              <Text style={styles.value}>{tokenBalance}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#555',
  },
  value: {
    fontSize: 14,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  transaction: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  incoming: {
    color: '#27ae60', // Green for incoming transactions
  },
  outgoing: {
    color: '#e74c3c', // Red for outgoing transactions
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3498db',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  errorBadge: {
    backgroundColor: '#e74c3c',
  },
});

export default EthereumWalletExample;
