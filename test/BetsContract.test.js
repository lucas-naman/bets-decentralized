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
    })

    describe('BetsContract Deployment', async () => {
        it('has a name', async () => {
            const name = await betsContract.name()
            assert.equal(name, 'DApp Bets')
        })
    })

    // describe('Farming Tokens', async () => {

    //     it('rewards investors for staking mDai tokens', async () => {
    //         let result
            
    //         result = await treatsToken.balanceOf(investor)
    //         assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before stacking')

    //         await treatsToken.approve(betsContract.address, tokens('100'), {from: investor})
    //         await betsContract.stakeTokens(tokens('100'), {from: investor})

    //         result = await treatsToken.balanceOf(investor)
    //         assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after stacking')

    //         result = await treatsToken.balanceOf(betsContract.address)
    //         assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI wallet balance correct after stacking')

    //         result = await betsContract.stakingBalance(investor)
    //         assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI wallet balance correct after stacking')

    //         result = await betsContract.isStaking(investor)
    //         assert.equal(result.toString(), 'true', 'investor staking status is correct after stacking')

    //         await betsContract.issueTokens({from: account[0]})
            
    //         result = await dappToken.balanceOf(investor)
    //         assert.equal(result.toString(), tokens('100'), "investor Dapp wallet is correct after ussuing tokens")

    //         await betsContract.issueTokens({ from: investor}).should.be.rejected;

    //         // Unstake
    //         await betsContract.unstakeTokens({from: investor })

    //         // After unstaking tests
    //         result = await treatsToken.balanceOf(betsContract.address)
    //         assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI wallet balance correct after unstacking')

    //         result = await treatsToken.balanceOf(investor)
    //         assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI wallet balance correct after unstacking')

    //         result = await betsContract.isStaking(investor)
    //         assert.equal(result.toString(), 'false', 'investor staking status is correct after unstacking')

    //         result = await betsContract.stakingBalance(investor)
    //         assert.equal(result.toString(), '0', 'investor staking balance is correct after unstacking')

    //     })
    // })

})