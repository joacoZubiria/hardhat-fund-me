const {deployments, ethers, getNamedAccounts, network} = require('hardhat');
const {assert, expect} = require('chai');
const {developmentChain} = require('../../helper-hardhat-config.js');

!developmentChain.includes(network.name)
?describe.skip
:describe("Test Unit deploy", function(){
    let fundMe,
    deployer,
    mockV3Aggregator;
    const sendValue = ethers.utils.parseEther('1'); // pasar 1 decimal a ether, es 1eth
    beforeEach(async function(){
        //const deployers = await ethers.getSigner() // agarra los accounts de la red (network) en el .config
        //const accountZero = accounst[0];
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]); // deploy todos los contratos con tag all
        fundMe = await ethers.getContract("FundMe",deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer);
    });

    describe("constructor", function(){
        it('debe matchear el address del fundme getPriceFeed con el mockv3aggregator', async function(){
            const getPriceFeed = await fundMe.getPriceFeed();
            console.log(getPriceFeed)
            console.log(mockV3Aggregator.address)
            assert.equal(getPriceFeed, mockV3Aggregator.address); // 
        })
    });

    describe("fund", function(){
        it("deberia fallar si no se mandan suficientes eth", async function(){
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
        });

        it('Si ingresas la cantidad correcta deberia funcionar', async function(){
            await fundMe.fund({value: sendValue});
            const response = await fundMe.getAddressToAmountFunded(deployer) // la cantidad de guita q puse desde la linea de arriba lo busca en el mapping
            assert.equal(response.toString(), sendValue.toString());
        });

        it('Agregar fundadores en el array deberia funcionar', async function(){
            await fundMe.fund({value:sendValue});
            const funder = await fundMe.getFunder(0);
            assert.equal(funder, deployer);
        });
    });

    describe('withdraw', function(){
        beforeEach(async function(){
            await fundMe.fund({value:sendValue});
        });

        it('Funcion withdraw debe retirar todos los eth', async function(){
            const startingFundBalanceValue = await fundMe.provider.getBalance(fundMe.address);
            const startingDeployerBalanceValue= await fundMe.provider.getBalance(deployer);

            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const{gasUsed,effectiveGasPrice} = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endFundBalanceValue = await fundMe.provider.getBalance(fundMe.address); 
            const endDeployerBalanceValue= await fundMe.provider.getBalance(deployer);

            assert.equal(endFundBalanceValue, 0); // balance del contrato es 0
            assert.equal(startingDeployerBalanceValue.add(startingFundBalanceValue).toString(), endDeployerBalanceValue.add(gasCost).toString()); // tener en cuenta beforeEach
        });

        it('Multiples fundadores retirando', async function(){
            const accounts = await ethers.getSigners() // agarra los accounts de la red (network) en el .config
            for(let i = 1; i<6; i++){ 
                //console.log(accounts[i]) //al parecer tiene muchas cuentas
                const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({value:sendValue});
            }
            const startingFundBalanceValue = await fundMe.provider.getBalance(fundMe.address);
            const startingDeployerBalanceValue= await fundMe.provider.getBalance(deployer);

            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const {gasUsed, effectiveGasPrice} = transactionReceipt;

            const endFundBalanceValue = await fundMe.provider.getBalance(fundMe.address); 
            const endDeployerBalanceValue= await fundMe.provider.getBalance(deployer);

            assert.equal(endFundBalanceValue, 0);
            assert.equal(startingDeployerBalanceValue.add(startingFundBalanceValue).toString(), endDeployerBalanceValue.add(gasUsed.mul(effectiveGasPrice)).toString());
        
            //getFunder reset
            await expect(fundMe.getFunder(0)).to.be.reverted;

            for(let i = 1; i<6; i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0)
            }

            
        });
        
        it('Cheaper withdraw...', async function(){
            const accounts = await ethers.getSigners() // agarra los accounts de la red (network) en el .config
            for(let i = 1; i<6; i++){ 
                //console.log(accounts[i]) //al parecer tiene muchas cuentas
                const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({value:sendValue});
            }
            const startingFundBalanceValue = await fundMe.provider.getBalance(fundMe.address);
            const startingDeployerBalanceValue= await fundMe.provider.getBalance(deployer);

            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const {gasUsed, effectiveGasPrice} = transactionReceipt;

            const endFundBalanceValue = await fundMe.provider.getBalance(fundMe.address); 
            const endDeployerBalanceValue= await fundMe.provider.getBalance(deployer);

            assert.equal(endFundBalanceValue, 0);
            assert.equal(startingDeployerBalanceValue.add(startingFundBalanceValue).toString(), endDeployerBalanceValue.add(gasUsed.mul(effectiveGasPrice)).toString());
        
            //getFunder reset
            await expect(fundMe.getFunder(0)).to.be.reverted;

            for(let i = 1; i<6; i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0)
            }

            
        });
        it("Solo el owner puede retirar eth", async function(){
            const accounts = await ethers.getSigners();
            const fundMeConnectedToContract = await fundMe.connect(accounts[1]);
            await expect(fundMeConnectedToContract.withdraw()).to.be.reverted //.revertedWith("FundMe__NotOwner");
        });
    });
});