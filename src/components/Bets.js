import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

function tokens(n) {
  return window.web3.utils.toWei(n, 'Ether')
}

class Ratio extends Component {

  async componentWillMount() {
    this.setPercents()
  }

  setPercents() {
    let amountA = Number(window.web3.utils.fromWei(this.props.bet.amountA, 'ether'))
    let amountB = Number(window.web3.utils.fromWei(this.props.bet.amountB, 'ether'))
    let percentageA = 0
    let percentageB = 0
    if (amountA > 0 && amountB > 0) {
      percentageA = Math.round(amountA / (amountA + amountB) * 100)
      percentageB = 100 - percentageA
    } else if (amountA > 0) {
      percentageA = 100;
    } else if (amountB > 0) {
      percentageB = 100;
    } else {
      percentageA = 50;
      percentageB = 50;
    }
    this.setState({percentageA: percentageA, percentageB: percentageB})
  }

  render () {
    return (
      <div className="progress">
        <div className="progress-bar" role="progressbar" style={{width: this.state.percentageA + "%"}} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
        <div className="progress-bar bg-danger" role="progressbar" style={{width: this.state.percentageB + "%"}} aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    )
  }
}

class Bets extends Component {

  async componentWillMount() {
    this.setState({bets : [], show: false, teamA: "", teamB: "", teamChosed: null, amount: 1, betId: null})
    this.getBets()
  }

  async getBets() {
    let bets = []
    let nbBets = await this.props.betsContract.methods.nbBets().call();
    for (let i = 0; i < nbBets; i++) {
      let bet = await this.props.betsContract.methods.bets(i).call();
      bets.push(bet)
    }
    this.setState({bets: bets})
  }

  openBetModal(teamA, teamB, id) {
    this.setState({show: true, teamA: teamA, teamB: teamB, teamChosed: null, amount: 1, betId: id})
  }

  bet() {
    if (this.state.amount >= 1 && this.state.teamChosed != null) {
      let teamBet = this.state.teamChosed ? this.state.teamA : this.state.teamB
      let oponent = this.state.teamChosed ? this.state.teamB : this.state.teamA
      var answer = window.confirm('Are you sure you want to bet ' + this.state.amount + ' Treats on ' + teamBet + ' on their match vs ' + oponent + ' ?');
      if (answer) {
			this.props.treatsToken.methods.approve(this.props.betsContract._address, tokens(this.state.amount.toString())).send({ from: this.props.account }).on('transactionHash', (hash) => {
				this.props.betsContract.methods.participate(this.state.betId, this.state.teamChosed, tokens(this.state.amount.toString())).send({ from: this.props.account }).on('transactionHash', (hash) => {
          this.getBets()
					this.setState({show: false})
				})
			})
      }
      else {
          //some code
      }
    }
  }

  render() {

    return (
      <div>
        <table className="table table-dark">
          <thead>
            <tr>
              <th scope="col">Team A</th>
              <th scope="col">Amount A</th>
              <th scope="col">Ratio</th>
              <th scope="col">Amount B</th>
              <th scope="col">Team B</th>
              <th scope="col">Close in</th>
              <th scope="col">Bet</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.bets.map((bet, idx) => (
                <tr key={bet.teamA + bet.teamB + bet.timeBetClose} >
                  <td>{bet.teamA}</td>
                  <td>{window.web3.utils.fromWei(bet.amountA, 'ether')}</td>
                  <td>
                    <Ratio bet={bet} />
                  </td>
                  <td>{window.web3.utils.fromWei(bet.amountB, 'ether')}</td>
                  <td>{bet.teamB}</td>
                  <td>{bet.timeBetClose > Math.floor(Date.now() / 1000) && !bet.closed ? Math.floor((bet.timeBetClose - Math.floor(Date.now() / 1000)) / 60).toString() + " mins" : "closed"} </td>
                  <td>
                    <button type="button" className="btn btn-success btn-sm" disabled={bet.timeBetClose < Math.floor(Date.now() / 1000) || bet.closed} onClick={() => this.openBetModal(bet.teamA, bet.teamB, idx)} >Bet</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
          <Modal.Header closeButton>
            <Modal.Title>Enter the Bet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ButtonGroup>
              <ToggleButton
                type="radio"
                variant="outline-primary"
                name="radio"
                value={true}
                checked={this.state.teamChosed}
                onChange={() => this.setState({teamChosed: true})}
              >
                {" " +this.state.teamA}
              </ToggleButton>
              <ToggleButton
                type="radio"
                variant="outline-danger"
                name="radio"
                value={false}
                checked={this.state.teamChosed === false}
                onChange={() => this.setState({teamChosed: false})}
              >
                {" " + this.state.teamB}
              </ToggleButton>
            </ButtonGroup>
            <br />
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroup-sizing-default">Treats Amount</span>
              </div>
              <input type="number" 
                className="form-control"
                onChange={(event) => this.setState({amount: event.target.value})}
                value={this.state.amount}
                min="1" max="100" 
                aria-label="Default" 
                aria-describedby="inputGroup-sizing-default" />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="warning" onClick={() => this.setState({show: false})}>
              Close
            </Button>
            <Button variant="success" onClick={() => this.bet()}>
              Bet
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default Bets;
