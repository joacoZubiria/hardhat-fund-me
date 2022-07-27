require('dotenv').config();
const {verify} = require('../utils/verify.js');
const {network} = require('hardhat');
const {networkConfig, developmentChain} = require("../helper-hardhat-config.js");

module.exports = async function({getNamedAccounts, deployments}){
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts(); // agarra deployer del .config
    const chainId = network.config.chainId;

    let ethUsdPriceAddress;
    const args = [ethUsdPriceAddress]
    if(developmentChain.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceAddress = ethUsdAggregator.address; // fake address pricefeed
    }else ethUsdPriceAddress = networkConfig[chainId]["ethUsdPriceFeed"]; // address de la chain con pricefeed

    log("Deploying contract");
    const fundMe = await deploy("FundMe", {
        from: deployer, // address del wallet
        args: [ethUsdPriceAddress], // args del constructor del contract
        log:true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
        
    if(!developmentChain.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(fundMe.address,[ethUsdPriceAddress]);
    }
    log('--------------------------------');
}

module.exports.tags = ['all','fundme'];