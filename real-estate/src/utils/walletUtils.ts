import { ethers } from 'ethers';

// MetaMask Detection and Connection Utility
// This helps bypass Phantom wallet override issues

export const forceMetaMaskConnection = async () => {
  try {
    // Check if we're in browser
    if (typeof window === 'undefined') {
      throw new Error('Not in browser environment');
    }

    console.log('Starting MetaMask connection...');

    // Check if MetaMask is installed at all
    if (!(window as any).ethereum) {
      throw new Error('No wallet detected. Please install MetaMask.');
    }

    let provider = null;

    // Method 1: Direct MetaMask check
    if ((window as any).ethereum?.isMetaMask && !(window as any).ethereum?.isPhantom) {
      console.log('Method 1: Direct MetaMask found');
      provider = (window as any).ethereum;
    }
    // Method 2: Check providers array
    else if ((window as any).ethereum?.providers) {
      console.log('Method 2: Checking providers array');
      const metaMask = (window as any).ethereum.providers.find(
        (p: any) => p.isMetaMask && !p.isPhantom
      );
      if (metaMask) {
        console.log('Method 2: MetaMask found in providers');
        provider = metaMask;
      }
    }
    // Method 3: Fallback to any ethereum provider
    else {
      console.log('Method 3: Using fallback ethereum provider');
      provider = (window as any).ethereum;
    }

    if (!provider) {
      throw new Error('MetaMask provider not found');
    }

    // Create ethers provider
    const ethersProvider = new ethers.BrowserProvider(provider);
    
    // Test connection by requesting accounts
    console.log('Requesting account access...');
    await provider.request({ 
      method: 'eth_requestAccounts' 
    });

    // Verify we can get a signer
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    console.log('Connected to wallet:', address);

    // Return the ethers provider (not the raw ethereum provider)
    return ethersProvider;

  } catch (error: any) {
    console.error('Force MetaMask connection error:', error);
    
    // Provide helpful error messages
    if (error.code === 4001) {
      throw new Error('Please approve the connection in MetaMask');
    } else if (error.code === -32002) {
      throw new Error('MetaMask is already processing. Please check MetaMask.');
    } else if (error.message?.includes('User rejected')) {
      throw new Error('Connection rejected. Please try again.');
    } else {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }
};

export const detectInstalledWallets = () => {
  const wallets = [];
  
  if ((window as any).ethereum?.isMetaMask) {
    wallets.push('MetaMask');
  }
  
  if ((window as any).ethereum?.isPhantom) {
    wallets.push('Phantom');
  }
  
  if ((window as any).ethereum?.isCoinbaseWallet) {
    wallets.push('Coinbase');
  }
  
  if ((window as any).ethereum?.providers) {
    const providers = (window as any).ethereum.providers;
    providers.forEach((provider: any) => {
      if (provider.isMetaMask) wallets.push('MetaMask (in providers)');
      if (provider.isPhantom) wallets.push('Phantom (in providers)');
    });
  }
  
  return wallets;
};
