pragma solidity ^0.5.0;

import "./TreatsToken.sol";

contract BetsContract {
    struct Gamble {
        address gambler;
        bool team;
        uint256 amount;
    }

    struct Bet {
        string teamA;
        string teamB;
        uint256 amountA;
        uint256 amountB;
        uint256 timeBetClose;
        Gamble[] gambles;
    }

    string public name = "DApp Bets";
    TreatsToken public treatsToken;
    address public owner;
    Bet[] public bets;

    constructor(TreatsToken _treatsToken) public {
        treatsToken = _treatsToken;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // modifier onlyWhileOpen() {
    //     require(block.timestamp >= startTime);
    //     _;
    // }

    function createBet(
        string memory _teamA,
        string memory _teamB,
        uint256 _timeBetClose
    ) public onlyOwner {
        Bet memory bet;
        bet.teamA = _teamA;
        bet.teamB = _teamB;
        bet.timeBetClose = _timeBetClose;
        bets.push(bet);
    }

    function participate(
        uint256 _idx,
        bool _team,
        uint256 _amount
    ) public {
        require(_amount > 0, "amount canot be 0");
        treatsToken.transferFrom(msg.sender, address(this), _amount);
        Gamble memory gamble = Gamble({
            team: _team,
            amount: _amount,
            gambler: msg.sender
        });
        bets[_idx].gambles.push(gamble);
    }

    function setBetWinner(uint256 _idx, bool _winner) public onlyOwner {
        for (uint256 i = 0; i < bets[_idx].gambles.length; i++) {
            if (_winner == bets[_idx].gambles[i].team) {
                uint256 amount = bets[_idx].gambles[i].amount;
                if (_winner) {
                    amount +=
                        (bets[_idx].gambles[i].amount / bets[_idx].amountB) *
                        bets[_idx].amountA;
                } else {
                    amount +=
                        (bets[_idx].gambles[i].amount / bets[_idx].amountA) *
                        bets[_idx].amountB;
                }
                treatsToken.transfer(bets[_idx].gambles[i].gambler, amount);
            }
        }
    }
}
