const { assert } = require('chai')

const BetsContract = artifacts.require('BetsContract')
const TreatsToken = artifacts.require('TreatsToken')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'Ether')
}

contract('BetsContract', (accounts) => {

    let treatsToken, betsContract

    before(async () => {
        treatsToken = await TreatsToken.new()
        betsContract = await BetsContract.new(treatsToken.address)

        await treatsToken.transfer(accounts[1], tokens('1000'), {from: accounts[0]})
        await treatsToken.transfer(accounts[2], tokens('1000'), {from: accounts[0]})
        await treatsToken.transfer(accounts[3], tokens('1000'), {from: accounts[0]})

    })

    describe('Treats Deployment', async () => {
        it('has a name', async () => {
            const name = await treatsToken.name()
            assert.equal(name, 'Treats Token')
        })
    })

    describe('BetsContract Deployment', async () => {
        it('has a name', async () => {
            const name = await betsContract.name()
            assert.equal(name, 'DApp Bets')
        })
    })


    describe('Check Treats Balances', async() => {
        it('Owner has all treats', async () => {
            let balance = await treatsToken.balanceOf(accounts[0])
            assert.equal(balance.toString(), tokens('999997000'))
        })

        it('Account 1 has treats', async () => {
            let balance = await treatsToken.balanceOf(accounts[1])
            assert.equal(balance.toString(), tokens('1000'))
        })

        it('Account 2 has treats', async () => {
            let balance = await treatsToken.balanceOf(accounts[2])
            assert.equal(balance.toString(), tokens('1000'))
        })

        it('Account 3 has treats', async () => {
            let balance = await treatsToken.balanceOf(accounts[3])
            assert.equal(balance.toString(), tokens('1000'))
        })
    });


    describe('Bets Tests', async () => {

        it('Create Bet', async () => {
            let result;

            await betsContract.createBet("RNG", "FPX", 90);

            result = await betsContract.nbBets()
            assert.equal(result.toString(), '1', "nbBets ok after creating bet")

            result = await betsContract.bets(0)
            assert.equal(result.teamA, 'RNG', "TeamA ok after bet creation")
            assert.equal(result.teamB, 'FPX', "TeamB ok after bet creation")
            assert.equal(result.amountA, '0', "Amount A ok after bet creation")
            assert.equal(result.amountB, '0', "Amount B ok after bet creation")
            assert(result.timeBetClose.toString() > Math.floor(Date.now() / 1000).toString()
            , "Time Bet Close ok after bet creation")
        })

        it('player 1 enter the bet 0', async () => {
            await treatsToken.approve(betsContract.address, tokens('100'), {from: accounts[1]})
            await betsContract.participate(0, true, tokens('100'), {from: accounts[1]})
            let gamble = await betsContract.gambles(0, 0)
            assert.equal(gamble.gambler, accounts[1], "Gamble address ok after player 1 enter the bet")
            assert.equal(gamble.amount, tokens('100'), "Gamble amount ok after player 1 enter the bet")
            assert.equal(gamble.team, true, "Gamble team ok after player 1 enter the bet")

            let balance = await treatsToken.balanceOf(accounts[1])
            assert.equal(balance.toString(), tokens('900'), "Balance gambler is ok after player 1 enter the bet")
        })

        it('Set bet winner', async () => {
            await betsContract.setBetWinner(0, true)

            let bet = await betsContract.bets(0)
            assert.equal(bet.closed, true, "Bet is closed after winner is set")

            let balance = await treatsToken.balanceOf(accounts[1])
            assert.equal(balance.toString(), tokens('1000'), "Balance gambler is ok after winner is set")
            
        })

        it("Bet after the bet is closed", async () => {
            await treatsToken.approve(betsContract.address, tokens('100'), {from: accounts[1]})
            await betsContract.participate(0, true, tokens('100'), {from: accounts[1]}).should.be.rejected;
        })

        it("Set bet winner after the bet is closed", async () => {
            await betsContract.setBetWinner(0, true).should.be.rejected;
        })

        it('4 player bet 1', async () => {

            await betsContract.createBet("G2", "FNC", 90);

            let result = await betsContract.nbBets()
            assert.equal(result.toString(), '2', "nbBets ok after creating bet")

            result = await betsContract.bets(1)
            assert.equal(result.teamA, 'G2', "TeamA ok after bet creation")
            assert.equal(result.teamB, 'FNC', "TeamB ok after bet creation")
            assert.equal(result.amountA, '0', "Amount A ok after bet creation")
            assert.equal(result.amountB, '0', "Amount B ok after bet creation")

            await treatsToken.approve(betsContract.address, tokens('1000'), {from: accounts[0]})
            await betsContract.participate(1, true, tokens('1000'), {from: accounts[0]})

            result = await betsContract.gambles(1, 0)
            assert.equal(result.team, true, "Gamble 0 Team ok after bet particapation")
            assert.equal(result.amount.toString(), tokens('1000'), "Gamble 0 Amount ok after bet particapation")

            await treatsToken.approve(betsContract.address, tokens('300'), {from: accounts[1]})
            await betsContract.participate(1, false, tokens('300'), {from: accounts[1]})

            result = await betsContract.gambles(1, 1)
            assert.equal(result.team, false, "Gamble 1 Team ok after bet particapation")
            assert.equal(result.amount.toString(), tokens('300'), "Gamble 1 Amount ok after bet particapation")

            await treatsToken.approve(betsContract.address, tokens('500'), {from: accounts[2]})
            await betsContract.participate(1, true, tokens('500'), {from: accounts[2]})

            result = await betsContract.gambles(1, 2)
            assert.equal(result.team, true, "Gamble 2 Team ok after bet particapation")
            assert.equal(result.amount.toString(), tokens('500'), "Gamble 2 Amount ok after bet particapation")

            await treatsToken.approve(betsContract.address, tokens('1000'), {from: accounts[3]})
            await betsContract.participate(1, false, tokens('1000'), {from: accounts[3]});

            result = await betsContract.gambles(1, 3)
            assert.equal(result.team, false, "Gamble 3 Team ok after bet particapation")
            assert.equal(result.amount.toString(), tokens('1000'), "Gamble 3 Amount ok after bet particapation")

            result = await betsContract.bets(1)
            assert.equal(result.amountA.toString(), tokens('1500'), "Amount A ok after bet particapations")
            assert.equal(result.amountB.toString(), tokens('1300'), "Amount B ok after bet particapations")

            await betsContract.setBetWinner(1, true);

            result = await betsContract.bets(1)
            assert.equal(result.closed, true, "Bet is closed after winner is set")

            let balance = await treatsToken.balanceOf(accounts[0])
            assert.equal(balance.toString(), '999997866666666666666666666', "Balance gambler 0 is ok after winner is set")

            balance = await treatsToken.balanceOf(accounts[1])
            assert.equal(balance.toString(), tokens('700'), "Balance gambler 1 is ok after winner is set")

            balance = await treatsToken.balanceOf(accounts[2])
            assert.equal(balance.toString(), '1433333333333333333333', "Balance gambler 2 is ok after winner is set")

            balance = await treatsToken.balanceOf(accounts[3])
            assert.equal(balance.toString(), tokens('0'), "Balance gambler 3 is ok after winner is set")

            result = await treatsToken.balanceOf(betsContract.address)
            assert.equal(result.toString(), '1', 'Bets Contract wallet balance correct after bet')
        })

        it('4 player bet 2', async () => {
            await betsContract.createBet("CLG", "C9", 90);

            let result = await betsContract.nbBets()
            assert.equal(result.toString(), '3', "nbBets ok after creating bet")

            result = await betsContract.bets(2)
            assert.equal(result.teamA, 'CLG', "TeamA ok after bet creation")
            assert.equal(result.teamB, 'C9', "TeamB ok after bet creation")
            assert.equal(result.amountA, '0', "Amount A ok after bet creation")
            assert.equal(result.amountB, '0', "Amount B ok after bet creation")

            await treatsToken.approve(accounts[3], tokens('1000'), {from: accounts[0]})
            await treatsToken.transfer(accounts[3], tokens('1000'), {from: accounts[0]})

            await treatsToken.approve(betsContract.address, tokens('2000'), {from: accounts[0]})
            await betsContract.participate(2, true, tokens('2000'), {from: accounts[0]})

            result = await betsContract.gambles(2, 0)
            assert.equal(result.team, true, "Gamble 0 Team ok after bet particapation")
            assert.equal(result.amount.toString(), tokens('2000'), "Gamble 0 Amount ok after bet particapation")

            await treatsToken.approve(betsContract.address, tokens('700'), {from: accounts[1]})
            await betsContract.participate(2, false, tokens('700'), {from: accounts[1]})

            result = await betsContract.gambles(2, 1)
            assert.equal(result.team, false, "Gamble 1 Team ok after bet particapation")
            assert.equal(result.amount.toString(), tokens('700'), "Gamble 1 Amount ok after bet particapation")

            await treatsToken.approve(betsContract.address, tokens('1300'), {from: accounts[2]})
            await betsContract.participate(2, true, tokens('1300'), {from: accounts[2]})

            result = await betsContract.gambles(2, 2)
            assert.equal(result.team, true, "Gamble 2 Team ok after bet particapation")
            assert.equal(result.amount.toString(), tokens('1300'), "Gamble 2 Amount ok after bet particapation")

            await treatsToken.approve(betsContract.address, tokens('1000'), {from: accounts[3]})
            await betsContract.participate(2, false, tokens('1000'), {from: accounts[3]});

            result = await betsContract.gambles(2, 3)
            assert.equal(result.team, false, "Gamble 3 Team ok after bet particapation")
            assert.equal(result.amount.toString(), tokens('1000'), "Gamble 3 Amount ok after bet particapation")

            result = await betsContract.bets(2)
            assert.equal(result.amountA.toString(), tokens('3300'), "Amount A ok after bet particapations")
            assert.equal(result.amountB.toString(), tokens('1700'), "Amount B ok after bet particapations")

            await betsContract.setBetWinner(2, false);

            result = await betsContract.bets(2)
            assert.equal(result.closed, true, "Bet is closed after winner is set")

            let balance = await treatsToken.balanceOf(accounts[0])
            assert.equal(balance.toString(), '999994866666666666666666666', "Balance gambler 0 is ok after winner is set")

            balance = await treatsToken.balanceOf(accounts[1])
            assert.equal(balance.toString(), '2058823529411764705882', "Balance gambler 1 is ok after winner is set")

            balance = await treatsToken.balanceOf(accounts[2])
            assert.equal(balance.toString(), '133333333333333333333', "Balance gambler 2 is ok after winner is set")

            balance = await treatsToken.balanceOf(accounts[3])
            assert.equal(balance.toString(), '2941176470588235294117', "Balance gambler 3 is ok after winner is set")

            result = await treatsToken.balanceOf(betsContract.address)
            assert.equal(result.toString(), '2', 'Bets Contract wallet balance correct after bet')
        })


    })

})