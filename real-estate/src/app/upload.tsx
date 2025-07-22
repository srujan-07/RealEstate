"use client";
import React, { useState } from "react";
import { ethers, BrowserProvider } from "ethers";
// PinataUpload import removed

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "registerProperty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const UploadPage = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [price, setPrice] = useState<string>("");
  // Remove ipfsHash state

  React.useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      setWallet(accounts[0] || null);
      setStatus(accounts[0] ? "Wallet connected: " + accounts[0] : "Wallet not connected");
    });
    const handleAccountsChanged = (accounts: string[]) => {
      setWallet(accounts[0] || null);
      setStatus(accounts[0] ? "Wallet connected: " + accounts[0] : "Wallet disconnected");
    };
    ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error("MetaMask not found");
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0] || null);
      setStatus(accounts[0] ? "Wallet connected: " + accounts[0] : "Wallet not connected");
    } catch (err: any) {
      setStatus("Wallet connection error: " + (err.message || err.toString()));
    }
  };

  // Remove handleRegister's ipfsHash checks and usage
  const handleRegister = async () => {
    if (!CONTRACT_ADDRESS) {
      setStatus("Missing contract address. Please set up your .env.local file.");
      return;
    }
    if (!wallet) {
      setStatus("Please connect your wallet first.");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setStatus("Please enter a valid price.");
      return;
    }
    setLoading(true);
    setStatus("Registering property on blockchain...");
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // Replace ipfsHash with a placeholder or new logic
      const tx = await contract.registerProperty("", ethers.parseEther(price));
      setStatus("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setStatus("Property registered successfully! Transaction hash: " + tx.hash);
    } catch (err: any) {
      setStatus("Error: " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "4rem" }}>
      <h1>Register Property</h1>
      <button
        onClick={connectWallet}
        style={{ marginBottom: "1rem", padding: "0.5rem 1.5rem", fontSize: "1rem", cursor: "pointer", borderRadius: "5px", border: "1px solid #0070f3", background: wallet ? "#e0e0e0" : "#0070f3", color: wallet ? "#333" : "#fff" }}
        disabled={!!wallet}
      >
        {wallet ? `Wallet Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Connect Wallet"}
      </button>
      {/* Remove PinataUpload and related UI */}
      <input
        type="number"
        placeholder="Property Price (ETH)"
        value={price}
        onChange={e => setPrice(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
        disabled={loading}
        min="0"
        step="any"
      />
      <button
        onClick={handleRegister}
        style={{ padding: "0.5rem 1.5rem", fontSize: "1rem", cursor: "pointer", borderRadius: "5px", border: "1px solid #ccc", background: "#f5f5f5" }}
        disabled={loading || !wallet}
      >
        {loading ? "Registering..." : "Register Property"}
      </button>
      {status && <p style={{ marginTop: "1rem", maxWidth: 400, textAlign: "center" }}>{status}</p>}
    </div>
  );
};

export default UploadPage; 