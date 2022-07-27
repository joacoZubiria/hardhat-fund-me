const {network} = require('hardhat');
const {developmentChain, INITIAL_ANSWER, DECIMALS} = require('../helper-hardhat-config.js');

// EL MOCK HACE COPIA DEL AGGREGATIRV3INTERFACE.SOL PARA LOS PRICEFEEDS
module.exports = async function({getNamedAccounts, deployments}){
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const name = network.name;
    if(developmentChain.includes(name)){
        log('Deploying on an development chain');
        const mockv3 = await deploy("MockV3Aggregator", {
            from:deployer,
            args:[DECIMALS,INITIAL_ANSWER],
            log:true,
        });
        log('Mocks deployed!');
        log('--------------------------------');
    }
}
module.exports.tags = ['all','mocks']; // para consola pones npx hardhat deploy --tags mocks