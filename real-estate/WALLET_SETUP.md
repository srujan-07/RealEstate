# RealEstate DApp - Wallet Connection Setup

## Prerequisites

1. **MetaMask Extension**: Install MetaMask browser extension
2. **Local Blockchain**: Have Ganache or similar running on `http://127.0.0.1:7545`
3. **Smart Contract**: Deploy the RealEstate contract to your local blockchain

## Setup Instructions

### 1. Environment Configuration

Update the `.env.local` file with your deployed contract address:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE
NEXT_PUBLIC_NETWORK_ID=1337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:7545
```

### 2. MetaMask Network Setup

Add your local network to MetaMask:
- **Network Name**: Ganache Local
- **RPC URL**: http://127.0.0.1:7545
- **Chain ID**: 1337
- **Currency Symbol**: ETH

### 3. Deploy Smart Contract

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Deploy the contract:
   ```bash
   npx hardhat run scripts/deploy.js --network ganache
   ```

4. Copy the deployed contract address to your `.env.local` file

### 4. Run the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Wallet Connection Features

- **Auto-detection**: Automatically detects if MetaMask is installed
- **Connection Status**: Shows current wallet connection status
- **Account Changes**: Automatically updates when you switch accounts in MetaMask
- **Network Switching**: Automatically prompts to switch to the correct network
- **Error Handling**: Clear error messages for common issues

## Troubleshooting

### Common Issues:

1. **"MetaMask not detected"**
   - Install MetaMask browser extension
   - Refresh the page after installation

2. **"Contract address not configured"**
   - Make sure you've deployed the smart contract
   - Update `.env.local` with the correct contract address

3. **"No accounts found"**
   - Unlock MetaMask
   - Make sure you have accounts in MetaMask

4. **Transaction failures**
   - Ensure you're connected to the correct network (Ganache)
   - Make sure you have enough ETH for gas fees
   - Check if the contract is deployed correctly

### Network Configuration:
- The app automatically tries to switch to Ganache (Chain ID: 1337)
- If the network isn't added to MetaMask, it will prompt you to add it
- Make sure your Ganache is running on the correct port (7545)

## Features

- **Property Listing**: View all properties on the blockchain
- **Property Registration**: Add new properties (upload page)
- **Property Purchase**: Buy properties that are for sale
- **Property Management**: Transfer ownership and set properties for sale
- **My Properties**: View properties you own

## File Structure

- `src/app/page.tsx` - Main property listing and management page
- `src/app/upload.tsx` - Property registration page
- `.env.local` - Environment configuration
- `backend/` - Smart contract files and deployment scripts
