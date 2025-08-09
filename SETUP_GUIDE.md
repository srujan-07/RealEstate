# 🏠 Real Estate NFT Platform Setup Guide

## 🚀 Complete IPFS + NFT Property Platform

This platform allows you to:
- ✅ Upload property details and documents to IPFS via Pinata
- ✅ Mint property NFTs on the blockchain
- ✅ Buy and sell property NFTs
- ✅ Store comprehensive metadata (images, documents, property details)
- ✅ Connect with MetaMask wallet

## 📋 Prerequisites

1. **Node.js** (v18+)
2. **MetaMask** browser extension
3. **Ganache** (local blockchain)
4. **Pinata Account** (for IPFS storage)

## 🔧 Setup Instructions

### 1. Pinata IPFS Setup

1. Go to [Pinata.cloud](https://pinata.cloud) and create an account
2. Navigate to **API Keys** section
3. Create a new API key with the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS` 
   - `unpin`
   - `userPinnedDataTotal`
4. Copy your:
   - API Key
   - API Secret
   - JWT Token

### 2. Environment Configuration

Update your `.env.local` file:

```bash
# NFT Smart Contract (Already deployed)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xff7816E77A41Dc74c00F6a177b6e9eeC47263491

# Pinata IPFS Configuration (REQUIRED!)
NEXT_PUBLIC_PINATA_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_PINATA_SECRET_KEY=your_actual_secret_key_here
NEXT_PUBLIC_PINATA_JWT=your_actual_jwt_token_here

# Network Configuration
NEXT_PUBLIC_NETWORK_URL=http://127.0.0.1:7545
NEXT_PUBLIC_CHAIN_ID=1337
```

### 3. Start the Platform

```bash
# Start Ganache (make sure it's running on port 7545)
# Import one of the Ganache accounts into MetaMask

# Start the frontend
cd real-estate
npm run dev
```

## 🎯 Features Overview

### 📝 Property Registration (`/register`)
- **Property Details**: Name, description, location, price, area, type
- **Additional Info**: Year built, bedrooms, bathrooms, parking, amenities
- **File Uploads**: Property images and documents
- **IPFS Storage**: All data stored on IPFS via Pinata
- **NFT Minting**: Creates an NFT representing the property

### 🏪 Marketplace (`/`)
- **Browse Properties**: View all properties for sale
- **Property Cards**: Images, details, and amenities from IPFS metadata
- **Purchase**: Buy properties with MetaMask
- **My Properties**: View owned properties
- **Statistics**: Total properties, for sale, owned

### 🔗 Smart Contract Features
- **ERC-721 NFT Standard**: Each property is a unique NFT
- **Property Metadata**: Comprehensive on-chain property information
- **Sale Management**: List/unlist properties for sale
- **Ownership Transfer**: Secure blockchain-based ownership
- **IPFS Integration**: Metadata stored on IPFS, hash on blockchain

## 📱 How to Use

### Register a Property
1. Click **"+ Register Property"**
2. Fill in property details
3. Upload property image (optional)
4. Upload property documents (optional)
5. Click **"Register Property & Mint NFT"**
6. Confirm MetaMask transactions

### Buy a Property
1. Browse the marketplace
2. Click **"Buy Now"** on desired property
3. Confirm MetaMask transaction
4. Property ownership transfers to you

### View Your Properties
1. Click **"My Properties"** tab
2. See all properties you own
3. Manage listings (coming soon)

## 🛠️ Technical Architecture

### Frontend (Next.js + React)
- `src/app/page.tsx` - Main marketplace
- `src/app/register/page.tsx` - Property registration
- `src/utils/ipfsUtils.ts` - Pinata IPFS functions
- `src/utils/nftUtils.ts` - Smart contract interactions
- `src/utils/walletUtils.ts` - MetaMask connection

### Smart Contract (Solidity)
- `RealEstateNFT.sol` - Main NFT contract
- **Deployed**: `0xff7816E77A41Dc74c00F6a177b6e9eeC47263491`
- **Network**: Ganache (Chain ID: 1337)

### IPFS Storage (Pinata)
- **Metadata**: Property information as JSON
- **Images**: Property photos
- **Documents**: Legal documents, certificates
- **Gateway**: `https://gateway.pinata.cloud/ipfs/`

## 📊 Data Structure

### Property Metadata (IPFS)
```json
{
  "name": "Luxury Villa Downtown",
  "description": "Beautiful 3-bedroom villa...",
  "image": "ipfs://QmXXX...",
  "attributes": [
    {"trait_type": "Location", "value": "Downtown"},
    {"trait_type": "Property Type", "value": "Residential"},
    {"trait_type": "Area", "value": 2500}
  ],
  "properties": {
    "documents": [
      {"name": "Title Deed", "ipfs": "ipfs://QmYYY..."}
    ],
    "amenities": ["Swimming Pool", "Garden"],
    "coordinates": "40.7128, -74.0060"
  }
}
```

### Smart Contract Property
```solidity
struct Property {
    uint256 tokenId;
    string name;
    string description;
    string location;
    uint256 price;
    uint256 area;
    string propertyType;
    address currentOwner;
    bool isForSale;
    string ipfsHash;
    uint256 createdAt;
    uint256 lastSalePrice;
}
```

## 🔐 Security Features

- **MetaMask Integration**: Secure wallet connection
- **Smart Contract**: Audited OpenZeppelin standards
- **IPFS Storage**: Decentralized file storage
- **Ownership Verification**: Blockchain-based ownership
- **Transaction Security**: All transfers via smart contract

## 🌐 Network Details

- **Blockchain**: Ganache (Local Development)
- **Chain ID**: 1337
- **RPC URL**: http://127.0.0.1:7545
- **Contract**: 0xff7816E77A41Dc74c00F6a177b6e9eeC47263491

## 🆘 Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed
- Add Ganache network to MetaMask
- Import Ganache account to MetaMask

### Pinata Upload Failures
- Check API credentials in `.env.local`
- Verify Pinata account has sufficient storage
- Check internet connection

### Smart Contract Errors
- Ensure Ganache is running
- Check contract address in environment
- Verify sufficient ETH balance for gas

## 🎉 Success Indicators

✅ **Pinata Connected**: Green status in registration form
✅ **MetaMask Connected**: Wallet address displayed
✅ **Contract Deployed**: Address shows in console
✅ **IPFS Upload**: Files successfully uploaded to Pinata
✅ **NFT Minted**: Transaction hash received
✅ **Property Listed**: Appears in marketplace

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables
3. Ensure Ganache is running
4. Check MetaMask network and account

---

**Your Real Estate NFT Platform is Ready! 🏠✨**

Start by registering your first property and watch it become an NFT on the blockchain!
