"use client";
import React, { useEffect, useState } from "react";
import { ethers, BrowserProvider } from "ethers";

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
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    // Set wallet on page load
    ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      console.log("useEffect page load accounts:", accounts);
      setWallet(accounts[0] || null);
      setStatus(accounts[0] ? "Wallet connected: " + accounts[0] : "Wallet not connected");
    });

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      console.log("accountsChanged event:", accounts);
      setWallet(accounts[0] || null);
      setStatus(accounts[0] ? "Wallet connected: " + accounts[0] : "Wallet disconnected");
    };
    ethereum.on("accountsChanged", handleAccountsChanged);

    // Cleanup
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error("MetaMask not found");
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("connectWallet accounts:", accounts);
      setWallet(accounts[0] || null);
      setStatus(accounts[0] ? "Wallet connected: " + accounts[0] : "Wallet not connected");
    } catch (err: any) {
      setStatus("Wallet connection error: " + (err.message || err.toString()));
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    setStatus(null);
    try {
      //@ts-ignore
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const count = await contract.propertyCount();
      const props = [];
      for (let i = 1; i <= count; i++) {
        const prop = await contract.properties(i);
        props.push(prop);
      }
      setProperties(props);
    } catch (err: any) {
      setStatus("Error fetching properties: " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  const buyProperty = async (property: any) => {
    setLoading(true);
    setStatus(null);
    try {
      //@ts-ignore
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.buyProperty(property.id, { value: property.price });
      setStatus("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setStatus("Property bought successfully! Transaction hash: " + tx.hash);
      fetchProperties();
    } catch (err: any) {
      setStatus("Error buying property: " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProperties = async (userAddress: string) => {
    try {
      //@ts-ignore
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const ids = await contract.getMyProperties(); // no explicit type
      const props = [];
      for (let i = 0; i < ids.length; i++) {
        const prop = await contract.properties(ids[i]);
        props.push(prop);
      }
      setMyProperties(props);
    } catch (err: any) {
      setStatus("Error fetching your properties: " + (err.message || err.toString()));
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
        {wallet ? `Wallet Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Connect Wallet"}
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
