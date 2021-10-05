const TreatsToken = artifacts.require('TreatsToken')
const BetsContract = artifacts.require('BetsContract')

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(TreatsToken)
  const treatsToken = await TreatsToken.deployed()

  await deployer.deploy(BetsContract, treatsToken.address)
  const betsContract = await BetsContract.deployed()

  await treatsToken.transfer(accounts[0], '1000000000000000000000000000')
};
