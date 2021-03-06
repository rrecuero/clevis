#!/bin/bash
if [ -z "$network" ]; then
  network="local"
fi

echo 'export PS1="\[\e]0;\u@\h: \w\a\]${debian_chroot:+($debian_chroot)}🗜️ \e[0;34mClevis\e[m:\e[0;32m\w\e[m 🗜️ "' >> ~/.bashrc

echo "Launching 🗜️ Clevis with network [ $network ]..."

if [ ! -f /dapp/clevis.json ]; then
  echo "Initializing Clevis..."
  clevis init
else
  echo "Updating..."
  clevis mocha
fi

if [ "$network" = "local" ]; then
  echo "Launching ganache-cli..."
  ganache-cli -h 0.0.0.0 > geth.log 2>&1 &
elif [ "$network" = "rinkeby" ]; then
  echo "Launching Rinkeby Geth..."
  /usr/bin/geth --rinkeby --light --cache 512 --maxpeers 25 --datadir ".geth-rinkeby" --rpc --rpcaddr 0.0.0.0 --rpcapi="db,eth,net,web3,personal" > geth.log 2>&1 &
elif [ "$network" = "ropsten" ]; then
  echo "Launching Ropsten Geth..."
  /usr/bin/geth --testnet --light --cache 512 --maxpeers 25 --datadir ".geth-ropsten" --rpc --rpcaddr 0.0.0.0 --rpcapi="db,eth,net,web3,personal" > geth.log 2>&1 &
elif [ "$network" = "mainnet" ]; then
  echo "Launching Rinkeby Geth..."
  /usr/bin/geth --light --cache 512 --maxpeers 25 --datadir ".geth" --rpc --rpcaddr 0.0.0.0 --rpcapi="db,eth,net,web3,personal" > geth.log 2>&1 &
else
  echo "Using external RPC network: $network"
  sed -i "s|http:\/\/localhost:8545|$network|g" clevis.json
fi

clevis start > react.log 2>&1 &

clevis help

clevis version

bash
