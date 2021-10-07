const BetsContract = artifacts.require('BetsContract')
const TreatsToken = artifacts.require('TreatsToken')

module.exports = async function(callback) {


    try {
        console.log("Creating Bets")

        let betsContract = await BetsContract.deployed()
    
        console.log("Deployed")
    
        await betsContract.createBet("RNG", "FPX", 90)
        await betsContract.createBet("G2", "FNC", 90)
        await betsContract.createBet("T1", "HLE", 90)
    
        console.log("Bets Created !")

    } catch(e) {
        console.log(e)
    }

    callback()
};