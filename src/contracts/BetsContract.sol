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
        mapping(uint256 => Gamble) gambles;
        uint256 nbGambles;
        bool closed;
    }

    string public name = "DApp Bets";
    TreatsToken public treatsToken;
    address public owner;
    mapping(uint256 => Bet) public bets;
    uint256 public nbBets;

    constructor(TreatsToken _treatsToken) public {
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
        bet.timeBetClose = now + (_timeBetClose * 1 minutes);
        bets[nbBets] = bet;
        nbBets += 1;
    }

    function participate(
        uint256 _idx,
        bool _team,
        uint256 _amount
    ) public {
        require(_amount > 0, "amount canot be 0");
        require(bets[_idx].timeBetClose > now, "Bet participation are closed");
        require(!bets[_idx].closed, "Bet participation are closed");
        require(_idx < nbBets, "Bet participation are closed");
        treatsToken.transferFrom(msg.sender, address(this), _amount);
        Gamble memory gamble = Gamble({
            team: _team,
            amount: _amount,
            gambler: msg.sender
        });
        bets[_idx].gambles[bets[_idx].nbGambles] = gamble;
        bets[_idx].nbGambles += 1;
    }

    function setBetWinner(uint256 _idx, bool _winner) public onlyOwner {
        require(bets[_idx].closed, "Bet is over");
        bets[_idx].closed = true;
        for (uint256 i = 0; i < bets[_idx].nbGambles; i++) {
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
