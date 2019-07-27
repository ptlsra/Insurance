# Insurance

# How to run Insurance API in a multi node environment?.

## Prerequistes

> Claims network up and running.

> Start broker API (https://mphasisblockchain@bitbucket.org/blockchainmphasisteam/broker.git)

> Mongodb

> IPFS at mbroker (port 5001 exposed)

## Clone insurance repo

```
$ git clone https://mphasisblockchain@bitbucket.org/blockchainmphasisteam/insurance.git
```

## Setup

```
$ cd insurance
```

> NOTE : give ip address of mbroker as parameter to initInsuranceMultiNode.sh.

```
$ ./initInsuranceMultiNode.sh {mbrokerAddress}
```


## Start the API

```
$ node app.js
```
