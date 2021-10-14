import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css'
import Navbar from './Navbar'
import Wallet from './Wallet'
import Bets from './Bets'
import Pool from './Pool';
import Web3 from 'web3'
import TreatsToken from '../abis/TreatsToken.json'
import BetsContract from '../abis/BetsContract.json'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockChainData()
  }

  async loadBlockChainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({account : accounts[0]})

    const networkId = await web3.eth.net.getId()

    if (accounts[0] === '0x108048E5F1880500FE0E4768926C1273Fa69dA4a') {
      this.setState({isOwner: true})
    }

    web3.eth.getBalance(this.state.account).then(balance => {
      this.setState({ethTokenBalance: balance})
    });
    // Load TreatsToken
    const treatsTokenData = TreatsToken.networks[networkId]
    if(treatsTokenData) {
      const treatsToken = new web3.eth.Contract(TreatsToken.abi, treatsTokenData.address)
      this.setState({ treatsToken })
      let treatsTokenBalance = await treatsToken.methods.balanceOf(this.state.account).call()
      this.setState({ treatsTokenBalance: treatsTokenBalance.toString() })
    } else {
      window.alert('To Use this app set up your metamask wallet to Ropsten Test Network.')
    }

    // Load BetsContract
    const betsContractData = BetsContract.networks[networkId]
    if(betsContractData) {
      const betsContract = new web3.eth.Contract(BetsContract.abi, betsContractData.address)
      this.setState({ betsContract })
    } else {
      window.alert('To Use this app set up your metamask wallet to Ropsten Test Network.')
    }
    this.setState({loading: false})
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider using Metamask!')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      treatsToken: {},
      betsContract: {},
      treatsTokenBalance: '0',
      ethTokenBalance: '0',
      loading: true,
      isOwner: false
    }
  }

  render() {
    let content
    if (this.state.loading) {
      content = <h1 id="loader">Loading...</h1>
    } else {
      content = <Switch>
        <Route path="/roulette">
          <Wallet {...this.state} />
        </Route>
        <Route path="/liquidity-pool">
          <Pool {...this.state}/>
        </Route>
        <Route path="/">
          <Bets {...this.state} />
        </Route>
      </Switch>
    }
    return (
      <div>
        <Router>
          <Navbar account={this.state.account} treatsTokenBalance={this.state.treatsTokenBalance} ethTokenBalance={this.state.ethTokenBalance} />
          <div className="container-fluid" style={{ marginTop: "100px"}}>
            <div className="row">
              <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '800px' }}>
                <div className="content mr-auto ml-auto">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                  </a>

                  {content}

                </div>
              </main>
            </div>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
