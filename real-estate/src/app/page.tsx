'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { forceMetaMaskConnection } from '../utils/walletUtils';
import { getAllProperties } from '../utils/nftUtils';

interface Property {
  tokenId: string;
  name: string;
  description: string;
  location: string;
  price: string;
  area: string;
  propertyType: string;
  currentOwner: string;
  isForSale: boolean;
  ipfsHash: string;
  createdAt: string;
  lastSalePrice: string;
}

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkWalletConnection();
    loadProperties();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          setWalletAddress(accounts[0]);
        }
      }
    } catch (error) {
      console.log('No wallet connected or error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setError('');
      setConnecting(true);
      
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask and try again.');
      }
      
      const provider = await forceMetaMaskConnection();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setIsConnected(true);
      setWalletAddress(address);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getAllProperties();
      if (result.success) {
        setProperties(result.properties || []);
      } else {
        setError(result.error || 'Failed to load properties');
        setProperties([]);
      }
    } catch (error: any) {
      console.error('Error loading properties:', error);
      setError('Failed to load properties. Please check your wallet connection and try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPrice = (price: string) => {
    const ethPrice = parseFloat(price);
    return `${ethPrice.toFixed(3)} ETH`;
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🏠 Real Estate NFT Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                    connecting
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Connected:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                    {formatAddress(walletAddress)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Real Estate with
              <span className="text-blue-600"> NFTs</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Register, trade, and manage real estate properties as non-fungible tokens on the blockchain. 
              Secure, transparent, and decentralized property ownership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition duration-200"
              >
                🚀 Register Property
              </Link>
              <Link
                href="/test-wallet"
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition duration-200"
              >
                🔗 Test Wallet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Property Registration</h4>
              <p className="text-gray-600">
                Register real estate properties as NFTs with detailed metadata, images, and documents stored on IPFS.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Trading Platform</h4>
              <p className="text-gray-600">
                Buy and sell property NFTs securely on the blockchain with transparent pricing and ownership transfer.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Secure Ownership</h4>
              <p className="text-gray-600">
                Immutable ownership records on the blockchain with verifiable property history and documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900">
              Available Properties
            </h3>
            <button
              onClick={loadProperties}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
            >
              🔄 Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No properties found.</p>
              <p className="text-gray-500">Be the first to register a property!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(0, 6).map((property) => (
                <div key={property.tokenId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl">🏠</span>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold mb-2">{property.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                    <p className="text-gray-500 text-sm mb-4">{truncateText(property.description)}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(property.price)}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {property.propertyType}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <span>Area: {property.area} sq ft</span>
                    </div>
                    {property.isForSale && (
                      <div className="mt-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          For Sale
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join the future of real estate with blockchain technology.
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium text-lg transition duration-200 inline-block"
          >
            Register Your First Property
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-xl font-semibold mb-4">Real Estate NFT Platform</h4>
            <p className="text-gray-400">
              Secure, transparent, and decentralized real estate ownership on the blockchain.
            </p>
            <div className="mt-6 flex justify-center space-x-6">
              <Link href="/register" className="text-gray-400 hover:text-white">
                Register Property
              </Link>
              <Link href="/test-wallet" className="text-gray-400 hover:text-white">
                Test Wallet
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
