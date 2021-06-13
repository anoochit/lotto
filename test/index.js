const assert = require('assert')

const SwapProcess = artifacts.require('SwapProcess')
const LottoToken = artifacts.require('LottoToken')
//const Draw = artifacts.require('Draw')
const Lottery = artifacts.require('Lottery')

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

contract('SwapProcess', async (accounts) => {
  const investor = accounts[1]

  it('deployed', async () => {
    const swapProcess = await SwapProcess.deployed()
    const lottoToken = await LottoToken.deployed()

    // check deployed
    assert.strictEqual(await lottoToken.symbol(), 'LTT', 'token name')

    // check balance of swap process
    const swapBalance = await lottoToken.balanceOf(SwapProcess.address)
    assert.notStrictEqual(swapBalance.toString(), 0, 'swap balance must not 0')
    console.log(' swap balance :', web3.utils.fromWei(swapBalance.toString(),'ether') , 'LTT')
  })

  it('buy tokens', async () => {
    const swapProcess = await SwapProcess.deployed()
    const lottoToken = await LottoToken.deployed()

    // swap 1 eth get 10 ltt
    await swapProcess.buyTokens({
      from: investor,
      value: web3.utils.toWei('1', 'ether'),
    })

    let investorBalance = await lottoToken.balanceOf(investor)
    console.log(' investor balance :', web3.utils.fromWei(investorBalance.toString(),'ether') , 'LTT')

    // expect 10 ltt
    assert.strictEqual(investorBalance.toString(), tokens('10'))

     // check balance of swap process
     const swapBalance = await lottoToken.balanceOf(SwapProcess.address)
     assert.notStrictEqual(swapBalance.toString(), 0, 'swap balance must not 0')
     console.log(' swap balance :', web3.utils.fromWei(swapBalance.toString(),'ether') , 'LTT')
  })

  it('sell tokens', async () => {
    const swapProcess = await SwapProcess.deployed()
    const lottoToken = await LottoToken.deployed()

    await lottoToken.approve(SwapProcess.address, tokens('10'), {
      from: investor,
    })

    await swapProcess.sellTokens(tokens('10'), { from: investor })

    let investorBalance = await lottoToken.balanceOf(investor)

    assert.strictEqual(investorBalance.toString(), tokens('0'))
  })
})

contract('Lottery', async (accounts) => {
  const buyer1 = accounts[0]
  const buyer2 = accounts[2]
  const buyer3 = accounts[4]

  it('lottery deployed', async () => {
    let lottery = await Lottery.deployed()
    assert.strictEqual(
      await lottery.name(),
      'Lottery',
      'lottery contract not deploy',
    )
  })

  it('buy lottery', async () => {
    const swapProcess = await SwapProcess.deployed()
    const lottoToken = await LottoToken.deployed()
    const lottery = await Lottery.deployed()

    // buyer1 swap 2 eth to 20 ltt
    await swapProcess.buyTokens({
      from: buyer1,
      value: web3.utils.toWei('2', 'ether'),
    })

    // buyer2 swap 2 eth to 20 ltt
    await swapProcess.buyTokens({
      from: buyer2,
      value: web3.utils.toWei('2', 'ether'),
    })

    // buyer3 swap 2 eth to 20 ltt
    await swapProcess.buyTokens({
      from: buyer3,
      value: web3.utils.toWei('2', 'ether'),
    })

    // check buyer1 balance should get 10ltt
    let buyer1Balance = await lottoToken.balanceOf(buyer1)
    assert.strictEqual(
      buyer1Balance.toString(),
      tokens('20'),
      'buyer1 must have 20 LTT',
    )

    // approve 2 ltt from buyer1
    await lottoToken.approve(lottery.address, tokens('2'), {
      from: buyer1,
    })

    // buy lotto for 2 ltt
    await lottery.buyLotto(1, '123456', {
      from: buyer1,
      value: web3.utils.toWei('2', 'ether'),
    })

    buyer1LTTBalance = await lottoToken.balanceOf(buyer1)
    assert.strictEqual(
      buyer1LTTBalance.toString(),
      tokens('18'),
      'buyer1 should have 18 LTT',
    )
 

    lotteryLTTBalance = await lottoToken.balanceOf(lottery.address)
    assert.strictEqual(
      lotteryLTTBalance.toString(),
      tokens('2'),
      'lottery LTT balance should be 2 LTT',
    )
 
    //--- buyer2 buy 5 ltt, buyer3 buy 5 ltt

    // approve 5 ltt from buyer2
    await lottoToken.approve(lottery.address, tokens('20'), {
      from: buyer2,
    })

    // buy lotto for 5 ltt
    await lottery.buyLotto(1, '56', {
      from: buyer2,
      value: web3.utils.toWei('20', 'ether'),
    })

    // approve 5 ltt from buyer3
    await lottoToken.approve(lottery.address, tokens('20'), {
      from: buyer3,
    })

    // buy lotto for 5 ltt
    await lottery.buyLotto(1, '456', {
      from: buyer3,
      value: web3.utils.toWei('20', 'ether'),
    })

    // check lottery balance
    lotteryLTTBalance = await lottoToken.balanceOf(lottery.address)
    console.log(' Lottery balance =',  web3.utils.fromWei(lotteryLTTBalance.toString(),'ether') , 'LTT' )
    assert.strictEqual(
      lotteryLTTBalance.toString(),
      tokens('42'),
      'lottery LTT balance must be 42',
    )

     // check balance of swap process
     const swapBalance = await lottoToken.balanceOf(SwapProcess.address)
     assert.notStrictEqual(swapBalance.toString(), 0, 'swap balance must not 0')
     console.log(' swap balance :', web3.utils.fromWei(swapBalance.toString(),'ether') , 'LTT')

    // lotteryIndex = await lottery.count()
    // assert.strictEqual(lotteryIndex.toString(), '3', 'count should be 1')
    // result = await lottery.lottos(3)
    // //console.log('buyer3 buy number = ', result.number.toString())
    // assert.strictEqual(
    //   result.number.toString(),
    //   '123456789',
    //   'buyer3 buy 123456789',
    // )
  })

  it('lottery number buy', async () => {
    const lottery = await Lottery.deployed()
    index = await lottery.count()
    console.log(' Lottery buy total :', index.toString())
    //assert.strictEqual(index.toString(), '3', 'buy 3 people')
    for(i=0;i<index; i++) {
      lotto = await lottery.lottos(i)
      console.log(' Buy #', i, lotto.buyer.toString(), ' Number : ', lotto.number, '  Amount : ',  web3.utils.fromWei(lotto.amount.toString(),'ether') )
    }
  })

  it('draw', async () => {
    const lottery = await Lottery.deployed()

    await lottery.setDraw(1)

    drawCount = await lottery.drawCount()

    for(i=0;i<drawCount; i++) {
      draws = await lottery.draws(i)
      console.log(' Draw #',i,draws.number)
    }

    for(i=0;i<drawCount; i++) {
      draws = await lottery.draw3Symbol(i)
      console.log(' Draw #',i,draws.number)
    }

    for(i=0;i<drawCount; i++) {
      draws = await lottery.draw2Symbol(i)
      console.log(' Draw #',i,draws.number)
    }

    await lottery.getWinner(1)
    winnerCount = await lottery.winnerCount()

    for(i=0;i<winnerCount; i++) {
      winners = await lottery.winners(i)
      console.log(' Winner #',i,winners.buyer.toString(), ' Prize : ', winners.prize.toString(),  ' Number : ', winners.number,  '  Amount : ',web3.utils.fromWei(winners.amount.toString(),'ether') )
    }
 
    //const event = result.logs[0].args
    //console.log(event.winnerAddress.toString())
  })
})
