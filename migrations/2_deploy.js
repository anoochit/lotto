const SwapProcess = artifacts.require('SwapProcess');
const LottoToken = artifacts.require('LottoToken');
const Lottery = artifacts.require('Lottery');


module.exports = async function (deployer) {
 
  await deployer.deploy(LottoToken);  
  let lottoToken = await LottoToken.deployed();
  
  await deployer.deploy(SwapProcess, lottoToken.address);
  let swapProcess = await SwapProcess.deployed();

  // mint token to swap process
  //await lottoToken.mintToSwapAddress(swapProcess.address);
  //console.log('swap LTT balance = ',(await lottoToken.balanceOf(swapProcess.address)).toString());

  await deployer.deploy(Lottery, lottoToken.address);
  let lottery = await Lottery.deployed();

  let totalSupply = '2000000000000000000000000000';

  await lottoToken.transfer(swapProcess.address, totalSupply)

};
