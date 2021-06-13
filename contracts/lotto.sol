// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./token.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract Lottery  is Owned  {
    LottoToken lottoToken;

    string public name = "Lottery";
    uint256 public count = 0;
    uint256 public drawCount = 0;
    uint256 public roundCount = 0;

    mapping(uint256 => Lotto) public lottos;
    mapping(uint256 => Draw) public draws;
    mapping(uint256 => Draw3Symbol) public draw3Symbol;
    mapping(uint256 => Draw2Symbol) public draw2Symbol;
    mapping(uint256 => Winner) public winners;

    event msgBuyLotto( 
        uint256 round,
        address buyer,
        string number,
        uint256 amount,
        uint256 indexed timestamp
    );

    event msgDraw( 
        uint256 round,
        string number,
        uint256 indexed timestamp
    );

    event msgWinner(
        uint256 indexed round,
        address winnerAddress,
        string number,
        uint256 indexed timestamp
    );

    struct Lotto {
        uint256 round;
        address buyer;
        string number;
        uint256 amount;
        uint256 timestamp;
    }

    struct Draw3Symbol {
        uint256 round;
        string number;
    }

    struct Draw2Symbol {
        uint256 round;
        string number;
    }

    struct Draw {
        uint256 round;
        string number;
    }

    struct Winner {
        uint256 round;
        uint256 prize;
        address buyer;
        string number;
        uint256 amount;
    }

    constructor(LottoToken _token) {
        lottoToken = _token;
    }

    function buyLotto(uint256 _round, string memory _number) public payable {
        require(msg.value >= 2000000000000000000, 'must buy at least 2 LTT');
        uint256 _amount = msg.value;

        // transfer LTT from buyer to lottery contract address
        lottoToken.transferFrom(msg.sender, address(this), _amount);

        // save buyer info in contract state valuw
        lottos[count] = Lotto(
            _round,
            msg.sender,
            _number,
            _amount,
            block.timestamp
        );

        count++;

        // emit event buying log
        emit msgBuyLotto(_round,  msg.sender, _number, _amount, block.timestamp);
    }

    function setDraw(uint256 _round) public onlyOwner {
        uint256 randNum = uint256(keccak256((abi.encodePacked(block.timestamp))));
        string memory randNumString = Strings.toString(randNum);
        string memory result = substring(randNumString, 0, 6);
        string memory result3symbol = substring(randNumString, 3, 6);
        string memory result2symbol = substring(randNumString, 4, 6);
        // string memory result = '123456';
        // string memory result3symbol = '456';
        // string memory result2symbol = '56';
 
        draws[drawCount] = Draw( _round, result);
        draw3Symbol[drawCount] = Draw3Symbol( _round, result3symbol);
        draw2Symbol[drawCount] = Draw2Symbol( _round, result2symbol);

        drawCount++;
        emit msgDraw(_round, result, block.timestamp);
    }
 
    function compareStrings(string memory a, string memory b)
        public
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    function substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) internal pure returns (string memory _result) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    uint256 public winnerCount = 0;

    function getWinner(uint256 _round) public {
        // get draw number
        for (uint256 indexDraw = 0; indexDraw < drawCount; indexDraw++) {
            if (draws[indexDraw].round == _round) {
                // compare with buyer
                for (uint256 indexBuyer = 0; indexBuyer < count; indexBuyer++) {
                    if (
                        (lottos[indexBuyer].round == _round) &&
                        (compareStrings(lottos[indexBuyer].number, draws[indexDraw].number))
                    ) {
                        winners[winnerCount] = Winner(
                            _round,
                            1,
                            lottos[indexBuyer].buyer,
                            lottos[indexBuyer].number,
                            lottos[indexBuyer].amount
                        );
                        winnerCount++;
                    }

                     if (
                        (lottos[indexBuyer].round == _round) &&
                        (compareStrings(lottos[indexBuyer].number, draw3Symbol[indexDraw].number))
                    ) {
                        winners[winnerCount] = Winner(
                            _round,
                            2,
                            lottos[indexBuyer].buyer,
                            lottos[indexBuyer].number,
                            lottos[indexBuyer].amount
                        );
                        winnerCount++;
                    }

                       if (
                        (lottos[indexBuyer].round == _round) &&
                        (compareStrings(lottos[indexBuyer].number, draw2Symbol[indexDraw].number))
                    ) {
                        winners[winnerCount] = Winner(
                            _round,
                            3,
                            lottos[indexBuyer].buyer,
                            lottos[indexBuyer].number,
                            lottos[indexBuyer].amount
                        );
                        winnerCount++;
                    }
                }
            }
        }
    }

    function resetLotto() public onlyOwner {
        winnerCount = 0;
        count = 0;
        drawCount = 0;
    }
}
