# bets-decentralized

A decentralized betting app with it's own currency based on the Ethereum Network.

## Run tests

    $> truffle test

## Run locally

    $> truffle migrate --reset

## Put on ropsten network

#### Rename secrets.json.template and put your secrets

    $> mv secrets.json.template secrets.json

#### Compile, open console and migrate

    $> truffle compile
    $> truffle console --network ropsten
    $> migrate
