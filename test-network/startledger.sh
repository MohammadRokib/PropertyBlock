#!/bin/bash

# Script to bring up the network and deploy the chaincode

# Bring up the network and create the channel
./network.sh up createChannel -c mychannel -ca -s couchdb

# Deploy the chaincode
./network.sh deployCC -ccn basic -ccp ../chaincode-api/chaincode-go -ccl go

