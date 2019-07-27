#!/bin/bash

#ipAddress=$(ip route get 8.8.8.8 | awk '{print $NF; exit}')

#Sleep for 140 sec
#echo "Waiting for broker API to come up..."
#sleep 170

#ipAddress=$(ip route get 8.8.8.8 | awk '{print $7; exit}')
ipAddress=$SYSTEM_IP

#get config data from main node and update contractConfig.json
node getContractConfig.js $ipAddress |& tee -a /api-logs/insurnace-api.log

node updateConfig $ipAddress 5001 $ipAddress 27017 7000 $ipAddress 24002 |& tee -a /api-logs/insurnace-api.log

echo "config.js updated"

if [ -f "/data/contractConfig.json" ]
then
    echo "contractConfig.json found."
        
    echo "copying contractConfig.json to : `${pwd}`"
    cp /data/contractConfig.json .

    # register insurance
    node registerInsurance.js |& tee -a /api-logs/insurnace-api.log

    #Start API
    echo "Starting API"
    node app.js |& tee -a /api-logs/insurnace-api.log
else

echo "contractConfig.json not found."

echo "dropping old databases"
node deleteDatabase.js |& tee -a /api-logs/insurnace-api.log

# register insurance
node registerInsurance.js |& tee -a /api-logs/insurnace-api.log

# start app.js
echo "starting app.js"
node app.js |& tee -a /api-logs/insurnace-api.log
fi