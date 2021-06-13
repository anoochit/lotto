// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./token.sol";

contract SwapProcess {
    string public name = "Swap Process";

    LottoToken public lottoToken;

    event msgBuyTokens(address indexed to, address token, uint256 amount);
    event msgSellTokens(address indexed to, address token, uint256 amount);

    constructor(LottoToken _token) {
        lottoToken = _token;        
    }

    function buyTokens() public payable {
        uint256 _amount = msg.value * 10;
        lottoToken.transfer(msg.sender, _amount);

        emit msgBuyTokens(msg.sender, address(lottoToken), _amount);
    }

    function sellTokens(uint256 _amount) public payable {
        // User can't sell more tokens than they have
        require(lottoToken.balanceOf(msg.sender) >= _amount);

        // Calculate the amount of Ether to redeem
        uint256 etherAmount = _amount / 10;

        // Require that EthSwap has enough Ether
        require(address(this).balance >= etherAmount);

        // Perform sale
        lottoToken.transferFrom(msg.sender, address(this), _amount);

        address payable buyer = payable(msg.sender);

        buyer.transfer(etherAmount);

        // Emit an event
        emit msgSellTokens(msg.sender, address(lottoToken), _amount);
    }
}
