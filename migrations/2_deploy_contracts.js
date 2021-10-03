const TreatsToken = artifacts.require('TreatsToken')
const BetsContract = artifacts.require('BetsContract')

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(TreatsToken)
  const treatsToken = await TreatsToken.deployed()

  await deployer.deploy(BetsContract, treatsToken.address)
  const betsContract = await BetsContract.deployed()

  // await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  // const tokenFarm = await TokenFarm.deployed()

  // await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // await daiToken.transfer(accounts[1], '100000000000000000000')
};
