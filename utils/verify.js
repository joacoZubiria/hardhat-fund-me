const {run} = require('hardhat');

const verify = async (contractAddress, args) => {
    console.log('Verifying contract...');
    try{
        await run('verify:verify',{
            address:contractAddress,
            constructorArguments:args,
        })
    }catch(e){
        if(e.message.toLowerCase().includes("alredy verified")){
            console.log('Contract alredy verified!');
        }else{
            console.log(e);
        }
    }
}

module.exports = {verify};