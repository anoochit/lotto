// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Owned {
    address private owner;
    address private newOwner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    constructor() {
        owner = msg.sender;
    }
}

contract LottoToken is ERC20 {
    //uint256 _totalSupply = 200 * 10**7 * 10**18;
    uint256 _totalSupply = 2000000000000000000000000000;

    event msgMintToSwapAddress(address _address, uint256 _amount);

    constructor() ERC20("LOTTO Token", "LTT") {
        _mint(msg.sender, _totalSupply);
        emit msgMintToSwapAddress(msg.sender, _totalSupply);
    }
}
