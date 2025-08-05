# Wallet Connection Guide - MetaMask vs Phantom

## Issue: Phantom Wallet Appearing Instead of MetaMask

If clicking "Connect Wallet" shows Phantom instead of MetaMask, this is because multiple wallet extensions are installed and Phantom is overriding the `window.ethereum` object.

## Solution Options:

### Option 1: Disable Phantom Temporarily (Recommended)
1. Open your browser extension settings
2. **Chrome**: Go to `chrome://extensions/`
3. **Firefox**: Go to `about:addons`
4. Find "Phantom" wallet extension
5. Toggle it OFF temporarily
6. Refresh the RealEstate DApp page
7. Now "Connect MetaMask Wallet" should open MetaMask

### Option 2: Use MetaMask Directly
1. Click on the MetaMask browser extension icon directly
2. Make sure you're connected to the correct network (Ganache - Chain ID 1337)
3. Refresh the DApp page - it should auto-detect the connection

### Option 3: Set MetaMask as Default (Browser Settings)
Some browsers allow you to set a default wallet:
1. Open MetaMask extension
2. Go to Settings → Advanced
3. Look for "Default Wallet" or "Preferred Wallet" setting
4. Set MetaMask as default

## Verification Steps:

After applying any solution:

1. **Refresh the page**
2. Check that the button shows "Connect MetaMask Wallet"
3. Click the button - it should open MetaMask (not Phantom)
4. Connect your account
5. The status should show "MetaMask connected: [your address]"

## Network Configuration:

Make sure MetaMask is configured with:
- **Network Name**: Ganache Local
- **RPC URL**: http://127.0.0.1:7545
- **Chain ID**: 1337
- **Currency Symbol**: ETH

## Troubleshooting:

### If you still see Phantom:
1. **Hard refresh**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear browser cache** for the localhost site
3. **Restart browser** completely
4. **Disable ALL other wallet extensions** except MetaMask

### If MetaMask doesn't appear:
1. Make sure MetaMask extension is **enabled**
2. Make sure MetaMask is **unlocked**
3. Check that you have accounts in MetaMask
4. Try clicking the MetaMask extension icon directly

### Error: "MetaMask not detected"
- Install MetaMask browser extension from [metamask.io](https://metamask.io)
- Enable the extension in your browser
- Refresh the page

## Code Changes Made:

The application now specifically looks for MetaMask using:
- `ethereum.isMetaMask` check
- Provider detection for multiple wallets
- MetaMask-specific error messages
- Clearer button text: "Connect MetaMask Wallet"

## Best Practice:

For DApp development, it's recommended to use only one wallet extension at a time to avoid conflicts. Keep Phantom disabled while working with this Ethereum-based DApp.
