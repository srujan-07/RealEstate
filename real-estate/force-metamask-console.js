// Browser Console Script - Force MetaMask Detection
// Copy and paste this into your browser console (F12) if Phantom is still appearing

console.log("🦊 MetaMask Detection Script");

// Check what wallets are detected
const wallets = [];
if (window.ethereum?.isMetaMask) wallets.push('MetaMask');
if (window.ethereum?.isPhantom) wallets.push('Phantom');
if (window.ethereum?.isCoinbaseWallet) wallets.push('Coinbase');

console.log("Detected wallets:", wallets);

// If Phantom is overriding, try to force MetaMask
if (window.ethereum?.isPhantom && !window.ethereum?.isMetaMask) {
  console.log("🚨 Phantom is overriding MetaMask!");
  console.log("Solutions:");
  console.log("1. Disable Phantom extension temporarily");
  console.log("2. Go to chrome://extensions/ and toggle Phantom OFF");
  console.log("3. Refresh this page");
  console.log("4. Or try this script after disabling Phantom:");
  
  // Try to find MetaMask in providers array
  if (window.ethereum?.providers) {
    const metaMask = window.ethereum.providers.find(p => p.isMetaMask);
    if (metaMask) {
      console.log("✅ Found MetaMask in providers!");
      window.ethereum = metaMask; // Override with MetaMask
      console.log("🦊 Switched to MetaMask provider");
    }
  }
}

// Test connection
async function testMetaMaskConnection() {
  try {
    if (!window.ethereum?.isMetaMask) {
      throw new Error("MetaMask not found or not active");
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    console.log("✅ MetaMask is working! Accounts:", accounts);
    
    if (accounts.length === 0) {
      console.log("🔓 MetaMask is locked or not connected. Click 'Connect MetaMask Wallet' button.");
    }
  } catch (error) {
    console.error("❌ MetaMask test failed:", error);
  }
}

// Run the test
testMetaMaskConnection();

// Instructions
console.log(`
🦊 INSTRUCTIONS:
1. If you see "Phantom is overriding MetaMask", disable Phantom extension
2. Go to chrome://extensions/ 
3. Find "Phantom" and toggle it OFF
4. Refresh this page
5. Click "Connect MetaMask Wallet" button
6. It should now open MetaMask instead of Phantom

Or run this in console: testMetaMaskConnection()
`);
