const BetsContract = artifacts.require('BetsContract')
const TreatsToken = artifacts.require('TreatsToken')
// const argv = require('yargs-parser')(process.argv.slice(2));


require('chai')
    .use(require('chai-as-promised'))
    .should()
function tokens(n) {
    return web3.utils.toWei(n, 'Ether')
}

module.exports = async function(callback) {


    try {
        console.log("get smart contracts")

        let betsContract = await BetsContract.deployed()
        let treatsToken = await TreatsToken.deployed()
    
        console.log("Setting winner")
    
        await betsContract.setBetWinner(process.argv[4], process.argv[5])
    
        console.log('Done !')

    } catch(e) {
        console.log("Usage: truffle exec scripts/set-bet-winner.js <idx: number> <winner: bool>")
        console.log("Example: truffle exec scripts/set-bet-winner.js 3 true")
        console.log("Example: truffle exec scripts/set-bet-winner.js 2 false")
        console.log(e)
    }

    callback()
};