// MetaMask Detection and Connection Utility
// This helps bypass Phantom wallet override issues

export const forceMetaMaskConnection = async () => {
  try {
    // Check if we're in browser
    if (typeof window === 'undefined') {
      throw new Error('Not in browser environment');
    }

    // Method 1: Direct MetaMask check
    if ((window as any).ethereum?.isMetaMask && !(window as any).ethereum?.isPhantom) {
      console.log('Method 1: Direct MetaMask found');
      return (window as any).ethereum;
    }

    // Method 2: Check providers array
    if ((window as any).ethereum?.providers) {
      const metaMask = (window as any).ethereum.providers.find(
        (p: any) => p.isMetaMask && !p.isPhantom
      );
      if (metaMask) {
        console.log('Method 2: MetaMask found in providers');
        return metaMask;
      }
    }

    // Method 3: Force detection by checking window objects
    const possibleMetaMask = [
      (window as any).ethereum,
      (window as any).web3?.currentProvider,
      (window as any).MetaMask,
    ].find(provider => provider?.isMetaMask);

    if (possibleMetaMask) {
      console.log('Method 3: MetaMask found via fallback');
      return possibleMetaMask;
    }

    // Method 4: Check if MetaMask is installed but hidden by Phantom
    if ((window as any).ethereum) {
      try {
        // Try to call a MetaMask-specific method
        const provider = (window as any).ethereum;
        const accounts = await provider.request({
          method: 'eth_accounts'
        });
        
        // If this works, we might have MetaMask
        console.log('Method 4: Potential MetaMask via eth_accounts');
        return provider;
      } catch (error) {
        console.log('Method 4 failed:', error);
      }
    }

    throw new Error('MetaMask not found');
  } catch (error) {
    console.error('Force MetaMask connection error:', error);
    throw error;
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
