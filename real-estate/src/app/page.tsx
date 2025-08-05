"use client";
import React, { useEffect, useState } from "react";
import { ethers, BrowserProvider } from "ethers";
import { forceMetaMaskConnection, detectInstalledWallets } from "../utils/walletUtils";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "properties",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "bool", "name": "forSale", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "propertyCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "propertyId", "type": "uint256" }
    ],
    "name": "buyProperty",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "propertyId", "type": "uint256" },
      { "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "propertyId", "type": "uint256" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "setForSale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyProperties",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const PropertyList = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [transferAddress, setTransferAddress] = useState<{[key: number]: string}>({});
  const [salePrice, setSalePrice] = useState<{[key: number]: string}>({});

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (wallet) fetchMyProperties(wallet);
  }, [wallet]);

  React.useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // Check for MetaMask specifically
        const ethereum = getMetaMaskProvider();
        
        if (ethereum) {
          // Check if already connected
          const accounts = await ethereum.request({ method: "eth_accounts" });
          console.log("useEffect page load accounts:", accounts);
          
          if (accounts.length > 0) {
            setWallet(accounts[0]);
            setStatus(`MetaMask connected: ${accounts[0]}`);
          } else {
            setWallet(null);
            setStatus("MetaMask not connected");
          }

          // Listen for account changes
          const handleAccountsChanged = (accounts: string[]) => {
            console.log("accountsChanged event:", accounts);
            if (accounts.length > 0) {
              setWallet(accounts[0]);
              setStatus(`MetaMask connected: ${accounts[0]}`);
            } else {
              setWallet(null);
              setStatus("MetaMask disconnected");
            }
          };

          // Listen for chain changes
          const handleChainChanged = (chainId: string) => {
            console.log("chainChanged event:", chainId);
            window.location.reload();
          };

          ethereum.on("accountsChanged", handleAccountsChanged);
          ethereum.on("chainChanged", handleChainChanged);

          // Cleanup
          return () => {
            if (ethereum.removeListener) {
              ethereum.removeListener("accountsChanged", handleAccountsChanged);
              ethereum.removeListener("chainChanged", handleChainChanged);
            }
          };
        } else {
          setStatus("MetaMask not detected. Please install MetaMask extension and disable other wallet extensions temporarily.");
        }
      } catch (error: any) {
        console.error("Error checking wallet connection:", error);
        setStatus(`Error: ${error.message}`);
      }
    };

    checkWalletConnection();
  }, []);

  // Helper function to get MetaMask provider specifically
  const getMetaMaskProvider = () => {
    if (typeof window === 'undefined') return null;
    
    // First check if MetaMask is directly available
    if ((window as any).ethereum?.isMetaMask && !(window as any).ethereum?.isPhantom) {
      return (window as any).ethereum;
    }
    
    // Check for multiple providers (modern approach)
    if ((window as any).ethereum?.providers?.length > 0) {
      const metaMaskProvider = (window as any).ethereum.providers.find(
        (provider: any) => provider.isMetaMask && !provider.isPhantom
      );
      if (metaMaskProvider) return metaMaskProvider;
    }
    
    // Check in window.ethereum.providers array
    if (Array.isArray((window as any).ethereum?.providers)) {
      const metaMaskProvider = (window as any).ethereum.providers.find(
        (provider: any) => provider.isMetaMask
      );
      if (metaMaskProvider) return metaMaskProvider;
    }
    
    // Direct access to MetaMask (bypass Phantom override)
    if ((window as any).ethereum && (window as any).ethereum.isMetaMask) {
      return (window as any).ethereum;
    }
    
    // Try accessing MetaMask through different methods
    if ((window as any).web3?.currentProvider?.isMetaMask) {
      return (window as any).web3.currentProvider;
    }
    
    // Last resort - check if ethereum exists and force MetaMask
    if ((window as any).ethereum) {
      // Force request from MetaMask specifically
      return (window as any).ethereum;
    }
    
    return null;
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setStatus("Detecting wallets...");
      
      // First, let's see what wallets are installed
      const installedWallets = detectInstalledWallets();
      console.log("Installed wallets:", installedWallets);
      
      if (installedWallets.includes('Phantom') && !installedWallets.includes('MetaMask')) {
        throw new Error("Only Phantom detected. Please install MetaMask extension from metamask.io");
      }
      
      setStatus("Connecting to MetaMask...");
      
      // Use the force connection utility
      const ethereum = await forceMetaMaskConnection();
      
      if (!ethereum) {
        throw new Error("MetaMask not found. Please install MetaMask and disable other wallet extensions.");
      }
      
      // Try to request accounts
      const accounts = await ethereum.request({ 
        method: "eth_requestAccounts",
        params: []
      });
      
      console.log("Connected accounts:", accounts);
      
      if (accounts && accounts.length > 0) {
        setWallet(accounts[0]);
        setStatus(`✅ MetaMask connected: ${accounts[0]}`);
        
        // Try to switch to Ganache network
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }], // 1337 in hex
          });
          setStatus(`✅ MetaMask connected and switched to Ganache network`);
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x539',
                  chainName: 'Ganache Local',
                  rpcUrls: ['http://127.0.0.1:7545'],
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
                }],
              });
              setStatus(`✅ MetaMask connected and Ganache network added`);
            } catch (addError) {
              console.error('Failed to add network:', addError);
            }
          }
        }
      } else {
        throw new Error("No accounts returned from MetaMask. Please unlock your wallet.");
      }
      
    } catch (err: any) {
      console.error("Connection error:", err);
      
      if (err.code === 4001) {
        setStatus("❌ Connection rejected. Please approve the connection in MetaMask.");
      } else if (err.message.includes("Phantom")) {
        setStatus("❌ Phantom detected. Please disable Phantom extension and refresh the page to use MetaMask.");
      } else {
        setStatus(`❌ Error: ${err.message}`);
      }
      
      setWallet(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const ethereum = getMetaMaskProvider();
      
      if (!ethereum) {
        throw new Error("MetaMask not detected. Please install MetaMask extension.");
      }

      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x1234567890123456789012345678901234567890') {
        throw new Error("Contract address not configured. Please deploy the contract and update .env.local");
      }

      const provider = new BrowserProvider(ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const count = await contract.propertyCount();
      console.log("Property count:", count.toString());
      
      const props = [];
      for (let i = 1; i <= count; i++) {
        const prop = await contract.properties(i);
        props.push(prop);
      }
      setProperties(props);
      setStatus(`Loaded ${props.length} properties`);
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      setStatus(`Error fetching properties: ${err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const buyProperty = async (property: any) => {
    if (!wallet) {
      setStatus("Please connect your MetaMask wallet first");
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const ethereum = getMetaMaskProvider();
      
      if (!ethereum) {
        throw new Error("MetaMask not detected");
      }
      
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setStatus("Initiating purchase transaction...");
      const tx = await contract.buyProperty(property.id, { value: property.price });
      setStatus("Transaction sent. Waiting for confirmation...");
      
      const receipt = await tx.wait();
      setStatus(`Property bought successfully! Transaction hash: ${tx.hash}`);
      
      // Refresh data
      await fetchProperties();
      if (wallet) await fetchMyProperties(wallet);
    } catch (err: any) {
      console.error("Error buying property:", err);
      setStatus(`Error buying property: ${err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProperties = async (userAddress: string) => {
    try {
      const ethereum = getMetaMaskProvider();
      
      if (!ethereum) {
        throw new Error("MetaMask not detected");
      }
      
      const provider = new BrowserProvider(ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const ids = await contract.getMyProperties();
      console.log("My property IDs:", ids);
      
      const props = [];
      for (let i = 0; i < ids.length; i++) {
        const prop = await contract.properties(ids[i]);
        props.push(prop);
      }
      setMyProperties(props);
    } catch (err: any) {
      console.error("Error fetching user properties:", err);
      setStatus(`Error fetching your properties: ${err.message || err.toString()}`);
    }
  };

  const transferProperty = async (propertyId: number) => {
    setLoading(true);
    setStatus(null);
    try {
      //@ts-ignore
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.transferOwnership(propertyId, transferAddress[propertyId]);
      setStatus("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setStatus("Ownership transferred! Transaction hash: " + tx.hash);
      fetchProperties();
      fetchMyProperties(wallet!);
    } catch (err: any) {
      setStatus("Error transferring ownership: " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };
  const setPropertyForSale = async (propertyId: number) => {
    setLoading(true);
    setStatus(null);
    try {
      //@ts-ignore
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.setForSale(propertyId, ethers.parseEther(salePrice[propertyId] || "0"));
      setStatus("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setStatus("Property set for sale! Transaction hash: " + tx.hash);
      fetchProperties();
      fetchMyProperties(wallet!);
    } catch (err: any) {
      setStatus("Error setting property for sale: " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: 24 }}>
      <h1>Property Marketplace</h1>
      <button
        onClick={connectWallet}
        style={{ marginBottom: "1rem", padding: "0.5rem 1.5rem", fontSize: "1rem", cursor: "pointer", borderRadius: "5px", border: "1px solid #0070f3", background: wallet ? "#e0e0e0" : "#0070f3", color: wallet ? "#333" : "#fff" }}
        disabled={!!wallet}
      >
        {wallet ? `MetaMask Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Connect MetaMask Wallet"}
      </button>
      {status && <p style={{ marginTop: "1rem", maxWidth: 400, textAlign: "center" }}>{status}</p>}
      {loading && <p>Loading...</p>}
      <h2 style={{ marginTop: 40 }}>My Properties</h2>
      {myProperties.length === 0 && <p>You do not own any properties.</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Owner</th>
            <th>Price (ETH)</th>
            <th>For Sale</th>
            <th>Transfer</th>
            <th>Set For Sale</th>
          </tr>
        </thead>
        <tbody>
          {myProperties.map((prop, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
              <td>{prop.id.toString()}</td>
              <td>{prop.owner}</td>
              <td>{ethers.formatEther(prop.price)} ETH</td>
              <td>{prop.forSale ? "Yes" : "No"}</td>
              <td>
                <input
                  type="text"
                  placeholder="New Owner Address"
                  value={transferAddress[prop.id] || ""}
                  onChange={e => setTransferAddress({ ...transferAddress, [prop.id]: e.target.value })}
                  style={{ width: 160, marginRight: 8 }}
                  disabled={loading}
                />
                <button onClick={() => transferProperty(prop.id)} disabled={loading || !transferAddress[prop.id] || !ethers.isAddress(transferAddress[prop.id])}>
                  Transfer
                </button>
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Sale Price (ETH)"
                  value={salePrice[prop.id] || ""}
                  onChange={e => setSalePrice({ ...salePrice, [prop.id]: e.target.value })}
                  style={{ width: 120, marginRight: 8 }}
                  disabled={loading}
                  min="0"
                  step="any"
                />
                <button onClick={() => setPropertyForSale(prop.id)} disabled={loading || !salePrice[prop.id] || isNaN(Number(salePrice[prop.id])) || Number(salePrice[prop.id]) <= 0}>
                  Set For Sale
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ marginTop: 40 }}>All Properties</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Owner</th>
            <th>Price (ETH)</th>
            <th>For Sale</th>
            <th>Buy</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
              <td>{prop.id.toString()}</td>
              <td>{prop.owner}</td>
              <td>{ethers.formatEther(prop.price)} ETH</td>
              <td>{prop.forSale ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => buyProperty(prop)} disabled={loading || !wallet || !prop.forSale}>
                  Buy
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyList;
