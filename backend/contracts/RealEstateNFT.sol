// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Land/Property structure
    struct Property {
        uint256 tokenId;
        string name;
        string description;
        string location;
        uint256 price;
        uint256 area; // in square feet
        string propertyType; // Residential, Commercial, Agricultural, etc.
        address currentOwner;
        bool isForSale;
        string ipfsHash; // IPFS hash containing all metadata and documents
        uint256 createdAt;
        uint256 lastSalePrice;
    }

    // Mapping from token ID to property details
    mapping(uint256 => Property) public properties;
    
    // Mapping to track all properties owned by an address
    mapping(address => uint256[]) public ownerProperties;
    
    // Array to store all property token IDs
    uint256[] public allProperties;
    
    // Events
    event PropertyMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        uint256 price,
        string ipfsHash
    );
    
    event PropertyListedForSale(
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller
    );
    
    event PropertySold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    
    event PropertyUpdated(
        uint256 indexed tokenId,
        string ipfsHash
    );

    constructor() ERC721("RealEstate NFT", "RENFT") Ownable(msg.sender) {}

    /**
     * @dev Mint a new property NFT
     */
    function mintProperty(
        address to,
        string memory name,
        string memory description,
        string memory location,
        uint256 price,
        uint256 area,
        string memory propertyType,
        string memory ipfsHash
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);
        
        // Create property struct
        properties[tokenId] = Property({
            tokenId: tokenId,
            name: name,
            description: description,
            location: location,
            price: price,
            area: area,
            propertyType: propertyType,
            currentOwner: to,
            isForSale: false,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp,
            lastSalePrice: 0
        });
        
        // Add to owner's properties
        ownerProperties[to].push(tokenId);
        
        // Add to all properties array
        allProperties.push(tokenId);
        
        emit PropertyMinted(tokenId, to, name, price, ipfsHash);
        
        return tokenId;
    }

    /**
     * @dev List property for sale
     */
    function listPropertyForSale(uint256 tokenId, uint256 price) public {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can list property");
        require(price > 0, "Price must be greater than 0");
        
        properties[tokenId].price = price;
        properties[tokenId].isForSale = true;
        
        emit PropertyListedForSale(tokenId, price, msg.sender);
    }

    /**
     * @dev Remove property from sale
     */
    function removeFromSale(uint256 tokenId) public {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can remove from sale");
        
        properties[tokenId].isForSale = false;
        
        emit PropertyListedForSale(tokenId, 0, msg.sender);
    }

    /**
     * @dev Buy property
     */
    function buyProperty(uint256 tokenId) public payable {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        require(properties[tokenId].isForSale, "Property is not for sale");
        require(msg.value >= properties[tokenId].price, "Insufficient payment");
        require(ownerOf(tokenId) != msg.sender, "Cannot buy your own property");
        
        address seller = ownerOf(tokenId);
        uint256 price = properties[tokenId].price;
        
        // Remove from seller's properties
        _removeFromOwnerProperties(seller, tokenId);
        
        // Transfer ownership
        _transfer(seller, msg.sender, tokenId);
        
        // Update property details
        properties[tokenId].currentOwner = msg.sender;
        properties[tokenId].isForSale = false;
        properties[tokenId].lastSalePrice = price;
        
        // Add to buyer's properties
        ownerProperties[msg.sender].push(tokenId);
        
        // Transfer payment to seller
        payable(seller).transfer(price);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit PropertySold(tokenId, seller, msg.sender, price);
    }

    /**
     * @dev Update property metadata (IPFS hash)
     */
    function updatePropertyMetadata(uint256 tokenId, string memory newIpfsHash) public {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can update metadata");
        
        properties[tokenId].ipfsHash = newIpfsHash;
        _setTokenURI(tokenId, newIpfsHash);
        
        emit PropertyUpdated(tokenId, newIpfsHash);
    }

    /**
     * @dev Get all properties for sale
     */
    function getPropertiesForSale() public view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count properties for sale
        for (uint256 i = 0; i < allProperties.length; i++) {
            if (properties[allProperties[i]].isForSale) {
                count++;
            }
        }
        
        // Create array of properties for sale
        uint256[] memory forSale = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allProperties.length; i++) {
            if (properties[allProperties[i]].isForSale) {
                forSale[index] = allProperties[i];
                index++;
            }
        }
        
        return forSale;
    }

    /**
     * @dev Get properties owned by an address
     */
    function getPropertiesByOwner(address owner) public view returns (uint256[] memory) {
        return ownerProperties[owner];
    }

    /**
     * @dev Get all properties
     */
    function getAllProperties() public view returns (uint256[] memory) {
        return allProperties;
    }

    /**
     * @dev Get property details
     */
    function getProperty(uint256 tokenId) public view returns (Property memory) {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        return properties[tokenId];
    }

    /**
     * @dev Get total number of properties
     */
    function getTotalProperties() public view returns (uint256) {
        return allProperties.length;
    }

    /**
     * @dev Helper function to remove property from owner's list
     */
    function _removeFromOwnerProperties(address owner, uint256 tokenId) private {
        uint256[] storage ownerProps = ownerProperties[owner];
        for (uint256 i = 0; i < ownerProps.length; i++) {
            if (ownerProps[i] == tokenId) {
                ownerProps[i] = ownerProps[ownerProps.length - 1];
                ownerProps.pop();
                break;
            }
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
