import axios from 'axios';

// Pinata API Configuration
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

const pinataApi = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    'Authorization': `Bearer ${PINATA_JWT}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param {Object} metadata - The metadata object to upload
 * @param {string} name - Name for the pinned content
 * @returns {Promise<Object>} - Returns IPFS hash and gateway URL
 */
export async function uploadMetadataToIPFS(metadata, name) {
  try {
    const response = await pinataApi.post('/pinning/pinJSONToIPFS', {
      pinataContent: metadata,
      pinataMetadata: {
        name: name,
        keyvalues: {
          type: 'property-metadata',
          timestamp: new Date().toISOString()
        }
      },
      pinataOptions: {
        cidVersion: 1
      }
    });

    const ipfsHash = response.data.IpfsHash;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    return {
      success: true,
      ipfsHash,
      gatewayUrl,
      pinataResponse: response.data
    };
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Upload file to IPFS via Pinata
 * @param {File} file - The file to upload
 * @param {string} name - Name for the pinned content
 * @returns {Promise<Object>} - Returns IPFS hash and gateway URL
 */
export async function uploadFileToIPFS(file, name) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: name,
      keyvalues: {
        type: 'property-document',
        filename: file.name,
        size: file.size,
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    return {
      success: true,
      ipfsHash,
      gatewayUrl,
      pinataResponse: response.data
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Upload multiple files to IPFS
 * @param {FileList} files - Files to upload
 * @param {string} folderName - Name for the folder
 * @returns {Promise<Array>} - Returns array of upload results
 */
export async function uploadMultipleFilesToIPFS(files, folderName) {
  const uploadPromises = Array.from(files).map((file, index) => {
    const fileName = `${folderName}-${index + 1}-${file.name}`;
    return uploadFileToIPFS(file, fileName);
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    return [];
  }
}

/**
 * Create comprehensive property metadata for NFT
 * @param {Object} propertyData - Property information
 * @param {Array} documentHashes - Array of IPFS hashes for documents
 * @param {string} imageHash - IPFS hash for property image
 * @returns {Object} - Formatted metadata object
 */
export function createPropertyMetadata(propertyData, documentHashes = [], imageHash = '') {
  return {
    name: propertyData.name,
    description: propertyData.description,
    image: imageHash ? `ipfs://${imageHash}` : '',
    external_url: '', // Can be updated with property website
    attributes: [
      {
        trait_type: "Location",
        value: propertyData.location
      },
      {
        trait_type: "Property Type",
        value: propertyData.propertyType
      },
      {
        trait_type: "Area",
        value: propertyData.area,
        display_type: "number"
      },
      {
        trait_type: "Price",
        value: propertyData.price,
        display_type: "number"
      },
      {
        trait_type: "Creation Date",
        value: new Date().toISOString(),
        display_type: "date"
      }
    ],
    properties: {
      location: propertyData.location,
      area: propertyData.area,
      propertyType: propertyData.propertyType,
      price: propertyData.price,
      documents: documentHashes.map(hash => ({
        name: hash.name || 'Document',
        ipfs: `ipfs://${hash.ipfsHash}`,
        gateway: hash.gatewayUrl
      })),
      coordinates: propertyData.coordinates || null,
      amenities: propertyData.amenities || [],
      yearBuilt: propertyData.yearBuilt || null,
      bedrooms: propertyData.bedrooms || null,
      bathrooms: propertyData.bathrooms || null,
      parking: propertyData.parking || null
    }
  };
}

/**
 * Retrieve content from IPFS
 * @param {string} ipfsHash - IPFS hash to retrieve
 * @returns {Promise<Object>} - Returns the content from IPFS
 */
export async function getFromIPFS(ipfsHash) {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test Pinata connection
 * @returns {Promise<boolean>} - Returns true if connection is successful
 */
export async function testPinataConnection() {
  try {
    // Check if environment variables are set
    if (!PINATA_JWT) {
      console.error('Pinata JWT not configured. Please set NEXT_PUBLIC_PINATA_JWT in your environment variables.');
      return false;
    }

    const response = await pinataApi.get('/data/testAuthentication');
    console.log('Pinata connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('Pinata connection failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Get user's pinned files from Pinata
 * @returns {Promise<Array>} - Returns array of pinned files
 */
export async function getPinnedFiles() {
  try {
    const response = await pinataApi.get('/data/pinList?status=pinned');
    return {
      success: true,
      files: response.data.rows
    };
  } catch (error) {
    console.error('Error getting pinned files:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}
