'use client';

import { useState } from 'react';
import { forceMetaMaskConnection } from '../../utils/walletUtils';

export default function TestWallet() {
  const [status, setStatus] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const testConnection = async () => {
    setStatus('Connecting...');
    setError('');
    setAddress('');

    try {
      console.log('Starting wallet connection test...');
      
      // Test the wallet connection
      const provider = await forceMetaMaskConnection();
      console.log('Provider obtained:', provider);

      // Get the signer and address
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      setStatus('Connected successfully!');
      setAddress(walletAddress);
      console.log('Connection successful. Address:', walletAddress);

    } catch (error: any) {
      console.error('Connection failed:', error);
      setStatus('Connection failed');
      setError(error.message || 'Unknown error occurred');
    }
  };

  const checkMetaMaskInstallation = () => {
    if (typeof window === 'undefined') {
      setError('Not in browser environment');
      return;
    }

    const hasEthereum = !!(window as any).ethereum;
    const hasMetaMask = !!(window as any).ethereum?.isMetaMask;
    const hasPhantom = !!(window as any).ethereum?.isPhantom;
    const providers = (window as any).ethereum?.providers || [];

    console.log('Wallet Detection Results:');
    console.log('- Has ethereum object:', hasEthereum);
    console.log('- Has MetaMask flag:', hasMetaMask);
    console.log('- Has Phantom flag:', hasPhantom);
    console.log('- Number of providers:', providers.length);
    console.log('- Providers:', providers);

    if (!hasEthereum) {
      setError('No wallet detected. Please install MetaMask.');
    } else if (hasPhantom && !hasMetaMask) {
      setError('Only Phantom wallet detected. Please install MetaMask.');
    } else if (providers.length > 0) {
      const metamaskProvider = providers.find((p: any) => p.isMetaMask && !p.isPhantom);
      if (metamaskProvider) {
        setStatus('MetaMask found in providers array');
      } else {
        setError('MetaMask not found in providers');
      }
    } else if (hasMetaMask) {
      setStatus('MetaMask detected');
    } else {
      setError('Unclear wallet state');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Wallet Connection Test
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          
          <div className="space-y-4">
            <button
              onClick={checkMetaMaskInstallation}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
            >
              Check MetaMask Installation
            </button>

            <button
              onClick={testConnection}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg"
            >
              Test Connection
            </button>
          </div>

          {status && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">Status: {status}</p>
            </div>
          )}

          {address && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                <span className="font-medium">Connected Address:</span>
                <br />
                <span className="font-mono text-sm">{address}</span>
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">
                <span className="font-medium">Error:</span> {error}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">1.</span>
              <span>Make sure MetaMask is installed and enabled</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">2.</span>
              <span>If you have Phantom wallet, disable it temporarily</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">3.</span>
              <span>Refresh the page after making changes</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">4.</span>
              <span>Check browser console for detailed error messages</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">5.</span>
              <span>Make sure you're connected to the correct network (Ganache: Chain ID 1337)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
