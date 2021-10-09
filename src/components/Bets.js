import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

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
    this.setState({bets : [], show: false})
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
              <th scope="col">Bet</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.bets.map((bet) => (
                  <tr key={bet.teamA + bet.teamB + bet.timeBetClose} >
                      <td>{bet.teamA}</td>
                      <td>{window.web3.utils.fromWei(bet.amountA, 'ether')}</td>
                      <td>
                        <Ratio bet={bet} />
                      </td>
                      <td>{window.web3.utils.fromWei(bet.amountB, 'ether')}</td>
                      <td>{bet.teamB}</td>
                      <td>
                        <button type="button" className="btn btn-success btn-sm" onClick={() => this.setState({show: true})} >Bet</button>
                      </td>
                  </tr>
              ))
            }
          </tbody>
        </table>
        <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.setState({show: false})}>
              Close
            </Button>
            <Button variant="primary" onClick={() => this.setState({show: false})}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default Bets;