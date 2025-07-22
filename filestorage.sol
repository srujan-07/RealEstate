// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileSharing {
    struct FileEntry {
        address uploader;
        string ipfsHash;
    }

    mapping(address => FileEntry[]) private receivedFiles;
    event FileShared(address indexed from, address indexed to, string ipfsHash);

    function shareFile(address recipient, string memory ipfsHash) public {
        receivedFiles[recipient].push(FileEntry(msg.sender, ipfsHash));
        emit FileShared(msg.sender, recipient, ipfsHash);
    }

    function getMyFiles() public view returns (FileEntry[] memory) {
        return receivedFiles[msg.sender];
    }
}
