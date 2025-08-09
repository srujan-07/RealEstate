import { ethers } from 'ethers';
import { forceMetaMaskConnection } from './walletUtils';
import RealEstateNFTABI from '../contracts/RealEstateNFT.json';

// Contract configuration
const CONTRACT_ADDRESS = "0xff7816E77A41Dc74c00F6a177b6e9eeC47263491";

/**
 * Get the RealEstateNFT contract instance
 * @returns {Promise<Object>} - Contract instance with signer
 */
export async function getNFTContract() {
  try {
    console.log('Getting NFT contract...');
    
    // Use our forced MetaMask connection - this now returns an ethers provider
    const provider = await forceMetaMaskConnection();
    if (!provider) {
      throw new Error('MetaMask not connected');
    }

    console.log('Got provider, getting signer...');
    const signer = await provider.getSigner();
    console.log('Got signer, creating contract...');
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, RealEstateNFTABI.abi, signer);
    console.log('Contract instance created successfully');
    
    return { contract, signer, provider };
  } catch (error: any) {
    console.error('Error getting NFT contract:', error);
    // Provide more helpful error messages
    if (error.message?.includes('User rejected')) {
      throw new Error('Please approve the connection in MetaMask');
    } else if (error.message?.includes('MetaMask not found')) {
      throw new Error('MetaMask not detected. Please install MetaMask and refresh the page.');
    } else {
      throw new Error(`Failed to connect to contract: ${error.message}`);
    }
  }
}

/**
 * Mint a new property NFT
 * @param {Object} propertyData - Property information
 * @param {string} ipfsHash - IPFS hash containing metadata
 * @returns {Promise<Object>} - Transaction result with token ID
 */
export async function mintPropertyNFT(propertyData, ipfsHash) {
  try {
    const { contract, signer } = await getNFTContract();
    const userAddress = await signer.getAddress();

    console.log('Minting NFT with data:', propertyData);
    console.log('IPFS Hash:', ipfsHash);

    const tx = await contract.mintProperty(
      userAddress,
      propertyData.name,
      propertyData.description,
      propertyData.location,
      ethers.parseEther(propertyData.price.toString()),
      propertyData.area,
      propertyData.propertyType,
      ipfsHash
    );

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    // Extract token ID from the event logs
    const mintEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'PropertyMinted';
      } catch (e) {
        return false;
      }
    });

    let tokenId = null;
    if (mintEvent) {
      const parsed = contract.interface.parseLog(mintEvent);
      tokenId = parsed.args.tokenId.toString();
    }

    return {
      success: true,
      transactionHash: tx.hash,
      tokenId,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    return {
      success: false,
      error: error.reason || error.message
    };
  }
}

/**
 * List property NFT for sale
 * @param {string} tokenId - Token ID to list
 * @param {string} price - Price in ETH
 * @returns {Promise<Object>} - Transaction result
 */
export async function listPropertyForSale(tokenId, price) {
  try {
    const { contract } = await getNFTContract();
    
    const priceInWei = ethers.parseEther(price.toString());
    const tx = await contract.listPropertyForSale(tokenId, priceInWei);
    
    console.log('Listing transaction sent:', tx.hash);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error listing property:', error);
    return {
      success: false,
      error: error.reason || error.message
    };
  }
}

/**
 * Buy property NFT
 * @param {string} tokenId - Token ID to buy
 * @returns {Promise<Object>} - Transaction result
 */
export async function buyPropertyNFT(tokenId) {
  try {
    const { contract } = await getNFTContract();
    
    // Get property details to determine price
    const property = await contract.getProperty(tokenId);
    const price = property.price;
    
    const tx = await contract.buyProperty(tokenId, {
      value: price
    });
    
    console.log('Purchase transaction sent:', tx.hash);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error buying property:', error);
    return {
      success: false,
      error: error.reason || error.message
    };
  }
}

/**
 * Get all properties for sale
 * @returns {Promise<Array>} - Array of properties for sale
 */
export async function getPropertiesForSale() {
  try {
    const { contract } = await getNFTContract();
    
    const tokenIds = await contract.getPropertiesForSale();
    const properties = [];
    
    for (const tokenId of tokenIds) {
      const property = await contract.getProperty(tokenId);
      properties.push({
        tokenId: tokenId.toString(),
        ...formatPropertyData(property)
      });
    }
    
    return {
      success: true,
      properties
    };
  } catch (error) {
    console.error('Error getting properties for sale:', error);
    return {
      success: false,
      properties: [],
      error: error.message
    };
  }
}

/**
 * Get properties owned by current user
 * @returns {Promise<Array>} - Array of owned properties
 */
export async function getOwnedProperties() {
  try {
    const { contract, signer } = await getNFTContract();
    const userAddress = await signer.getAddress();
    
    const tokenIds = await contract.getPropertiesByOwner(userAddress);
    const properties = [];
    
    for (const tokenId of tokenIds) {
      const property = await contract.getProperty(tokenId);
      properties.push({
        tokenId: tokenId.toString(),
        ...formatPropertyData(property)
      });
    }
    
    return {
      success: true,
      properties
    };
  } catch (error) {
    console.error('Error getting owned properties:', error);
    return {
      success: false,
      properties: [],
      error: error.message
    };
  }
}

/**
 * Get all properties
 * @returns {Promise<Array>} - Array of all properties
 */
export async function getAllProperties() {
  try {
    const { contract } = await getNFTContract();
    
    const tokenIds = await contract.getAllProperties();
    const properties = [];
    
    for (const tokenId of tokenIds) {
      const property = await contract.getProperty(tokenId);
      properties.push({
        tokenId: tokenId.toString(),
        ...formatPropertyData(property)
      });
    }
    
    return {
      success: true,
      properties
    };
  } catch (error) {
    console.error('Error getting all properties:', error);
    return {
      success: false,
      properties: [],
      error: error.message
    };
  }
}

/**
 * Get property details by token ID
 * @param {string} tokenId - Token ID
 * @returns {Promise<Object>} - Property details
 */
export async function getPropertyDetails(tokenId) {
  try {
    const { contract } = await getNFTContract();
    
    const property = await contract.getProperty(tokenId);
    
    return {
      success: true,
      property: {
        tokenId: tokenId.toString(),
        ...formatPropertyData(property)
      }
    };
  } catch (error) {
    console.error('Error getting property details:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update property metadata
 * @param {string} tokenId - Token ID
 * @param {string} newIpfsHash - New IPFS hash
 * @returns {Promise<Object>} - Transaction result
 */
export async function updatePropertyMetadata(tokenId, newIpfsHash) {
  try {
    const { contract } = await getNFTContract();
    
    const tx = await contract.updatePropertyMetadata(tokenId, newIpfsHash);
    
    console.log('Update transaction sent:', tx.hash);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error updating property metadata:', error);
    return {
      success: false,
      error: error.reason || error.message
    };
  }
}

/**
 * Remove property from sale
 * @param {string} tokenId - Token ID
 * @returns {Promise<Object>} - Transaction result
 */
export async function removeFromSale(tokenId) {
  try {
    const { contract } = await getNFTContract();
    
    const tx = await contract.removeFromSale(tokenId);
    
    console.log('Remove from sale transaction sent:', tx.hash);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error removing from sale:', error);
    return {
      success: false,
      error: error.reason || error.message
    };
  }
}

/**
 * Format property data from contract
 * @param {Object} property - Raw property data from contract
 * @returns {Object} - Formatted property data
 */
function formatPropertyData(property) {
  return {
    name: property.name,
    description: property.description,
    location: property.location,
    price: ethers.formatEther(property.price),
    area: property.area.toString(),
    propertyType: property.propertyType,
    currentOwner: property.currentOwner,
    isForSale: property.isForSale,
    ipfsHash: property.ipfsHash,
    createdAt: new Date(Number(property.createdAt) * 1000).toISOString(),
    lastSalePrice: ethers.formatEther(property.lastSalePrice)
  };
}

/**
 * Get total number of properties
 * @returns {Promise<number>} - Total properties count
 */
export async function getTotalProperties() {
  try {
    const { contract } = await getNFTContract();
    const total = await contract.getTotalProperties();
    return Number(total);
  } catch (error) {
    console.error('Error getting total properties:', error);
    return 0;
  }
}
