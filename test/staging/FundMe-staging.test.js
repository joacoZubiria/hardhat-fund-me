const { ethers, getNamedAccounts, network} = require('hardhat');
const { assert } = require('chai');
const { developmentChain } = require('../../helper-hardhat-config.js');

developmentChain.includes(network.name)
? describe.skip
: describe("fundme", function(){
    // todas las funciones test para la testnet
    let fundMe,
    deployer;
    const sendValue = ethers.utils.parseEther("0.1");// plata de metmask aca

    beforeEach(async function(){
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
    });

    it('fundMe func', async function(){
        await fundMe.fund({value: sendValue});

        const transactionResponse = await fundMe.withdraw();
        await transactionResponse.wait(1);

        const endFund = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endFund.toString(),"0");
        
        /*const response = await fundMe.getAddressToAmountFunded(deployer) // la cantidad de guita q puse desde la linea de arriba lo busca en el mapping
        assert.equal(response.toString(), sendValue.toString());*/
    });

    it('withdraw func', async function(){
        const transactionResponse = await fundMe.cheaperWithdraw();
        await transactionResponse.wait(1);

        const endFund = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endFund,0);

    })
})