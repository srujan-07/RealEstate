const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying RealEstateNFT contract...");

  // Get the ContractFactory and Signers here
  const RealEstateNFT = await ethers.getContractFactory("RealEstateNFT");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const realEstateNFT = await RealEstateNFT.deploy();
  
  await realEstateNFT.waitForDeployment();
  
  const contractAddress = await realEstateNFT.getAddress();
  console.log("RealEstateNFT deployed to:", contractAddress);
  
  // Log the contract ABI for frontend usage
  console.log("\n=== Contract Details ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    address: contractAddress,
    abi: RealEstateNFT.interface.formatJson(),
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString()
  };
  
  // Save to backend directory
  fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2));
  
  // Save ABI to frontend directory
  const frontendPath = '../real-estate/src/contracts/';
  if (!fs.existsSync(frontendPath)) {
    fs.mkdirSync(frontendPath, { recursive: true });
  }
  
  fs.writeFileSync(frontendPath + 'RealEstateNFT.json', JSON.stringify({
    address: contractAddress,
    abi: JSON.parse(RealEstateNFT.interface.formatJson())
  }, null, 2));
  
  console.log("Deployment info saved to:", frontendPath + 'RealEstateNFT.json');
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("📍 Contract Address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
