pragma solidity >=0.7.0 <0.9.0;
// SPDX-License-Identifier: MIT
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
        bool closed;
    }

    string public name = "DApp Bets";
    TreatsToken public treatsToken;
    address public owner;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => Gamble[]) public gambles;
    uint256 public nbBets;

    constructor(TreatsToken _treatsToken) {
        treatsToken = _treatsToken;
        owner = msg.sender;
        nbBets = 0;
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
        bet.closed = false;
        bet.timeBetClose = block.timestamp + (_timeBetClose * 1 minutes);
        bets[nbBets] = bet;
        nbBets += 1;
    }

    function participate(
        uint256 _idx,
        bool _team,
        uint256 _amount
    ) public {
        require(_amount > 0, "amount canot be 0");
        require(
            bets[_idx].timeBetClose > block.timestamp,
            "Bet participation are closed"
        );
        require(!bets[_idx].closed, "Bet participation are closed");
        require(_idx < nbBets, "Bet participation are closed");
        treatsToken.transferFrom(msg.sender, address(this), _amount);
        Gamble memory gamble = Gamble({
            team: _team,
            amount: _amount,
            gambler: msg.sender
        });
        gambles[_idx].push(gamble);
        if (_team) {
            bets[_idx].amountA += _amount;
        } else {
            bets[_idx].amountB += _amount;
        }
    }

    function setBetWinner(uint256 _idx, bool _winner) public onlyOwner {
        require(!bets[_idx].closed, "Bet is over");
        bets[_idx].closed = true;
        for (uint256 i = 0; i < gambles[_idx].length; i++) {
            if (_winner == gambles[_idx][i].team) {
                uint256 amount = gambles[_idx][i].amount;
                if (bets[_idx].amountA > 0 && bets[_idx].amountB > 0) {
                    if (_winner) {
                        amount +=
                            (gambles[_idx][i].amount * bets[_idx].amountB) /
                            bets[_idx].amountA;
                    } else {
                        amount +=
                            (gambles[_idx][i].amount * bets[_idx].amountA) /
                            bets[_idx].amountB;
                    }
                }
                treatsToken.transfer(gambles[_idx][i].gambler, amount);
            }
        }
    }
}
