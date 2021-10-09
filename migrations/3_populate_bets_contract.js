const TreatsToken = artifacts.require('TreatsToken')
const BetsContract = artifacts.require('BetsContract')

function tokens(n) {
    return web3.utils.toWei(n, 'Ether')
}

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(TreatsToken)
  const treatsToken = await TreatsToken.deployed()

  await deployer.deploy(BetsContract, treatsToken.address)
  const betsContract = await BetsContract.deployed()

  console.log("Deployed")
    
  await betsContract.createBet("RNG", "FPX", 90)
  await betsContract.createBet("G2", "FNC", 90)
  await betsContract.createBet("T1", "HLE", 90)

  console.log("Bets Created !")
  console.log("participating")

  await treatsToken.approve(betsContract.address, tokens('10'), {from: accounts[0]})
  await betsContract.participate(0, true, tokens('10'), {from: accounts[0]})

  await treatsToken.approve(betsContract.address, tokens('13'), {from: accounts[0]})
  await betsContract.participate(0, false, tokens('13'), {from: accounts[0]})

  console.log('Done !')
};