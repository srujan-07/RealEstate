require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: ["0xa84ae6e2252e4c4fbdf6e1cf0e7de7c36babe6261d575d632d3dddf11e3d43f4"]
    }
  }
}; 