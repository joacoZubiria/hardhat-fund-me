const { version } = require("ethers");
require('dotenv').config();

require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require("@nomiclabs/hardhat-ethers");
require('@nomiclabs/hardhat-etherscan');
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-solhint");


const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers:[{version: "0.8.9"}, {version:"0.7.0"}]
  },
  networks:{
    rinkeby:{
      url: RINKEBY_RPC_URL,
      accounts:[PRIVATE_KEY],
      chainId:4,
      blockConfirmations:6,
    },
    localhost:{
      url:"http/127.0.0.1:8545",
      chainId:31337,
    }
  },
  namedAccounts:{
    deployer:{
      default:0,
      //4:1,  chainId de rinkeby
    },
    user:{
      default:1,
    }
  },
  etherscan:{
    apiKey:process.env.ETHERSCAN_API_KEY,
  },
  gasReporter:{
    enabled:true,
    outputFile:"gas-reporter.txt",
    noColors:true,
    currency:"USD",
    token:"MATIC",
  }
};
