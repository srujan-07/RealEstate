// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RealEstate {
    struct Property {
        uint256 id;
        string ipfsHash;
        address owner;
        uint256 price;
        bool forSale;
    }

    uint256 public propertyCount;
    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public ownerProperties;

    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string ipfsHash, uint256 price);
    event PropertyForSale(uint256 indexed propertyId, uint256 price);
    event PropertySold(uint256 indexed propertyId, address indexed oldOwner, address indexed newOwner, uint256 price);
    event OwnershipTransferred(uint256 indexed propertyId, address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner(uint256 propertyId) {
        require(properties[propertyId].owner == msg.sender, "Not the property owner");
        _;
    }

    function registerProperty(string memory ipfsHash, uint256 price) public {
        propertyCount++;
        properties[propertyCount] = Property(propertyCount, ipfsHash, msg.sender, price, false);
        ownerProperties[msg.sender].push(propertyCount);
        emit PropertyRegistered(propertyCount, msg.sender, ipfsHash, price);
    }

    function setForSale(uint256 propertyId, uint256 price) public onlyOwner(propertyId) {
        Property storage prop = properties[propertyId];
        prop.forSale = true;
        prop.price = price;
        emit PropertyForSale(propertyId, price);
    }

    function buyProperty(uint256 propertyId) public payable {
        Property storage prop = properties[propertyId];
        require(prop.forSale, "Property not for sale");
        require(msg.value >= prop.price, "Insufficient payment");
        address oldOwner = prop.owner;
        require(oldOwner != msg.sender, "Cannot buy your own property");
        prop.owner = msg.sender;
        prop.forSale = false;
        ownerProperties[msg.sender].push(propertyId);
        // Remove from old owner's list
        uint256[] storage oldOwnerProps = ownerProperties[oldOwner];
        for (uint256 i = 0; i < oldOwnerProps.length; i++) {
            if (oldOwnerProps[i] == propertyId) {
                oldOwnerProps[i] = oldOwnerProps[oldOwnerProps.length - 1];
                oldOwnerProps.pop();
                break;
            }
        }
        payable(oldOwner).transfer(prop.price);
        emit PropertySold(propertyId, oldOwner, msg.sender, prop.price);
    }

    function transferOwnership(uint256 propertyId, address newOwner) public onlyOwner(propertyId) {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = properties[propertyId].owner;
        properties[propertyId].owner = newOwner;
        ownerProperties[newOwner].push(propertyId);
        // Remove from old owner's list
        uint256[] storage oldOwnerProps = ownerProperties[oldOwner];
        for (uint256 i = 0; i < oldOwnerProps.length; i++) {
            if (oldOwnerProps[i] == propertyId) {
                oldOwnerProps[i] = oldOwnerProps[oldOwnerProps.length - 1];
                oldOwnerProps.pop();
                break;
            }
        }
        emit OwnershipTransferred(propertyId, oldOwner, newOwner);
    }

    function getProperty(uint256 propertyId) public view returns (Property memory) {
        return properties[propertyId];
    }

    function getMyProperties() public view returns (uint256[] memory) {
        return ownerProperties[msg.sender];
    }
} 