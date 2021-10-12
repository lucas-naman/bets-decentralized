const TreatsToken = artifacts.require('TreatsToken.sol')
const BetsContract = artifacts.require('BetsContract.sol')

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(TreatsToken)
  const treatsToken = await TreatsToken.deployed()

  await deployer.deploy(BetsContract, treatsToken.address)
  const betsContract = await BetsContract.deployed()

};
