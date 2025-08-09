'use client';

import React, { useState, useRef } from 'react';
import { uploadMetadataToIPFS, uploadFileToIPFS, uploadMultipleFilesToIPFS, createPropertyMetadata, testPinataConnection } from '../../utils/ipfsUtils';
import { mintPropertyNFT } from '../../utils/nftUtils';

interface PropertyFormData {
  name: string;
  description: string;
  location: string;
  price: string;
  area: string;
  propertyType: string;
  coordinates: string;
  amenities: string;
  yearBuilt: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
}

export default function PropertyRegistration() {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    description: '',
    location: '',
    price: '',
    area: '',
    propertyType: 'Residential',
    coordinates: '',
    amenities: '',
    yearBuilt: '',
    bedrooms: '',
    bathrooms: '',
    parking: ''
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [mintResult, setMintResult] = useState<any>(null);
  const [pinataConnected, setPinataConnected] = useState<boolean | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);

  // Test Pinata connection on component mount
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await testPinataConnection();
        setPinataConnected(connected);
      } catch (error) {
        console.error('Pinata connection check failed:', error);
        setPinataConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedDocuments(e.target.files);
    }
  };

  const validateForm = () => {
    const requiredFields = ['name', 'description', 'location', 'price', 'area', 'propertyType'];
    for (const field of requiredFields) {
      if (!formData[field as keyof PropertyFormData]) {
        setUploadStatus(`Error: ${field} is required`);
        return false;
      }
    }

    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setUploadStatus('Error: Price must be a valid positive number');
      return false;
    }

    if (isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
      setUploadStatus('Error: Area must be a valid positive number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!pinataConnected) {
      setUploadStatus('Error: Pinata connection failed. Please check your API credentials in environment variables. Create a .env.local file with NEXT_PUBLIC_PINATA_API_KEY, NEXT_PUBLIC_PINATA_SECRET_KEY, and NEXT_PUBLIC_PINATA_JWT.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Starting upload process...');
    setMintResult(null);

    try {
      // Step 1: Upload image to IPFS
      let imageHash = '';
      if (selectedImage) {
        setUploadStatus('Uploading property image to IPFS...');
        const imageResult = await uploadFileToIPFS(selectedImage, `${formData.name}-image`);
        if (imageResult.success) {
          imageHash = imageResult.ipfsHash;
          setUploadStatus(`Image uploaded: ${imageHash}`);
        } else {
          throw new Error(`Image upload failed: ${imageResult.error}`);
        }
      }

      // Step 2: Upload documents to IPFS
      let documentHashes: any[] = [];
      if (selectedDocuments && selectedDocuments.length > 0) {
        setUploadStatus('Uploading property documents to IPFS...');
        const docResults = await uploadMultipleFilesToIPFS(selectedDocuments, `${formData.name}-docs`);
        documentHashes = docResults.filter(result => result.success);
        setUploadStatus(`Documents uploaded: ${documentHashes.length} files`);
      }

      // Step 3: Create comprehensive metadata
      setUploadStatus('Creating property metadata...');
      const propertyData = {
        ...formData,
        price: Number(formData.price),
        area: Number(formData.area),
        coordinates: formData.coordinates || null,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : [],
        yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : null,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        parking: formData.parking || null
      };

      const metadata = createPropertyMetadata(propertyData, documentHashes, imageHash);

      // Step 4: Upload metadata to IPFS
      setUploadStatus('Uploading metadata to IPFS...');
      const metadataResult = await uploadMetadataToIPFS(metadata, `${formData.name}-metadata`);
      
      if (!metadataResult.success) {
        throw new Error(`Metadata upload failed: ${metadataResult.error}`);
      }

      setUploadStatus(`Metadata uploaded: ${metadataResult.ipfsHash}`);

      // Step 5: Mint NFT on blockchain
      setUploadStatus('Minting Property NFT on blockchain...');
      const mintResult = await mintPropertyNFT(propertyData, metadataResult.ipfsHash);

      if (mintResult.success) {
        setUploadStatus('🎉 Property NFT minted successfully!');
        setMintResult({
          ...mintResult,
          metadataHash: metadataResult.ipfsHash,
          metadataUrl: metadataResult.gatewayUrl,
          imageHash,
          documentCount: documentHashes.length
        });
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          location: '',
          price: '',
          area: '',
          propertyType: 'Residential',
          coordinates: '',
          amenities: '',
          yearBuilt: '',
          bedrooms: '',
          bathrooms: '',
          parking: ''
        });
        setSelectedImage(null);
        setSelectedDocuments(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (documentsInputRef.current) documentsInputRef.current.value = '';
      } else {
        throw new Error(`NFT minting failed: ${mintResult.error}`);
      }

    } catch (error: any) {
      setUploadStatus(`❌ Error: ${error.message}`);
      console.error('Property registration error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        🏠 Register Property as NFT
      </h1>

      {/* Pinata Connection Status */}
      <div className={`mb-6 p-4 rounded-lg ${pinataConnected === null ? 'bg-yellow-100' : pinataConnected ? 'bg-green-100' : 'bg-red-100'}`}>
        <h3 className="font-semibold mb-2">IPFS Connection Status:</h3>
        <p>
          {pinataConnected === null && '🟡 Checking Pinata connection...'}
          {pinataConnected === true && '🟢 Pinata connected successfully!'}
          {pinataConnected === false && (
            <span>
              🔴 Pinata connection failed. Please check your API credentials in environment variables.
              <br />
              <br />
              <strong>Required environment variables:</strong>
              <br />
              • NEXT_PUBLIC_PINATA_API_KEY
              <br />
              • NEXT_PUBLIC_PINATA_SECRET_KEY
              <br />
              • NEXT_PUBLIC_PINATA_JWT
              <br />
              <br />
              <strong>Setup Instructions:</strong>
              <br />
              1. Go to <a href="https://app.pinata.cloud/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pinata Dashboard</a>
              <br />
              2. Create an account and get your API credentials
              <br />
              3. Create a <code>.env.local</code> file in the project root with:
              <br />
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
{`NEXT_PUBLIC_PINATA_API_KEY=your_api_key_here
NEXT_PUBLIC_PINATA_SECRET_KEY=your_secret_key_here
NEXT_PUBLIC_PINATA_JWT=your_jwt_token_here`}
              </pre>
              4. Restart the development server
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Luxury Villa Downtown"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Agricultural">Agricultural</option>
              <option value="Land">Land</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of the property..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 123 Main St, City, State"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coordinates (Lat, Lng)
            </label>
            <input
              type="text"
              name="coordinates"
              value={formData.coordinates}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 40.7128, -74.0060"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (ETH) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area (sq ft) *
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2500"
              required
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Built
            </label>
            <input
              type="number"
              name="yearBuilt"
              value={formData.yearBuilt}
              onChange={handleInputChange}
              min="1800"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2020"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parking Spaces
            </label>
            <input
              type="text"
              name="parking"
              value={formData.parking}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2 Car Garage"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amenities (comma-separated)
          </label>
          <input
            type="text"
            name="amenities"
            value={formData.amenities}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Swimming Pool, Garden, Gym, Security"
          />
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Image
            </label>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedImage && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedImage.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Documents
            </label>
            <input
              type="file"
              ref={documentsInputRef}
              onChange={handleDocumentsChange}
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedDocuments && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedDocuments.length} file(s)
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || !pinataConnected}
          className={`w-full py-3 px-4 rounded-md font-medium ${
            isUploading || !pinataConnected
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition duration-200`}
        >
          {isUploading ? '🔄 Processing...' : '🚀 Register Property & Mint NFT'}
        </button>
      </form>

      {/* Status Display */}
      {uploadStatus && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Status:</h3>
          <p className="text-sm">{uploadStatus}</p>
        </div>
      )}

      {/* Mint Result */}
      {mintResult && (
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            🎉 Property NFT Created Successfully!
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Token ID:</strong> {mintResult.tokenId}</p>
            <p><strong>Transaction Hash:</strong> 
              <a 
                href={`https://etherscan.io/tx/${mintResult.transactionHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                {mintResult.transactionHash}
              </a>
            </p>
            <p><strong>Block Number:</strong> {mintResult.blockNumber}</p>
            <p><strong>Gas Used:</strong> {mintResult.gasUsed}</p>
            <p><strong>Metadata IPFS:</strong> 
              <a 
                href={mintResult.metadataUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                {mintResult.metadataHash}
              </a>
            </p>
            {mintResult.imageHash && (
              <p><strong>Image IPFS:</strong> {mintResult.imageHash}</p>
            )}
            <p><strong>Documents Uploaded:</strong> {mintResult.documentCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
