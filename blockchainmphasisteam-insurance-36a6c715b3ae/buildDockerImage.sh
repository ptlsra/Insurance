#!/bin/bash

# Build docker image
source .env
echo "Building docker image with TAG: "$TAG
docker build -t ec2-52-52-172-203.us-west-1.compute.amazonaws.com:5080/claimsinsurance:$TAG .

# Push image to docker registry
docker push ec2-52-52-172-203.us-west-1.compute.amazonaws.com:5080/claimsinsurance:$TAG
