const Web3 = require('web3');
const express = require('express');
var app = express();
var fs = require('fs');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var mongoUrl = "mongodb://127.0.0.1:27017/";

var solidityFileList        = ["Policy.sol","Hospital.sol","ClaimManagement.sol","Insurance.sol"];
var solidityJsonFileList    = ["Policy.json","Hospital.json","ClaimManagement.json","Insurance.json"];
var contractNameList        = ["Policy","Hospital","ClaimManagement","Insurance"];
var contractAddresses=[];

let rawdata = fs.readFileSync('../contractConfig.json');
let contractsData = JSON.parse(rawdata);
console.log(JSON.stringify(contractsData));

policyContractAddress = contractsData.policyContract;
insuranceContractAddress = contractsData.insuranceContract;
claimContractAddress = contractsData.claimContract;
hospitalContractAddress = contractsData.hospitalContract;

console.log("************* fetched contract address from config file ****************");


function pushContractToDB(solidityFileName, solidityJsonfileName, contractName, contractAddress, abi){
    var MongoClient = require('mongodb').MongoClient;
    var url = mongoUrl+"blockchaindb";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("************ connected to mongodb client at localhost *************");
        console.log("************ storing record **********");
        let myobj = {contractAddress:contractAddress, contractName:contractName, abi:abi};
        var collectionName = "contracts";
        db.collection(collectionName).insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("contract abi pushed to mongodb ....");
            //console.log(res);
            db.close();
        });
    });

}





var policyContractSource = fs.readFileSync("Policy.json");
var policyContract = JSON.parse(policyContractSource)["contracts"];
var policyabi = JSON.parse(policyContract["Policy.sol:Policy"].abi);

console.log("************** pushing Policy contract **********");
pushContractToDB(solidityFileList[0], solidityJsonFileList[0], contractNameList[0], policyContractAddress, policyabi);




setTimeout(function(){
        //Hospital.sol
        var hospitalContractSource = fs.readFileSync("Hospital.json");
        var hospitalContract = JSON.parse(hospitalContractSource)["contracts"];
        var hospitalabi = JSON.parse(hospitalContract["Hospital.sol:Hospital"].abi);
        console.log("************** pushing Hospital contract **********");

        pushContractToDB(solidityFileList[1], solidityJsonFileList[1], contractNameList[1], hospitalContractAddress, hospitalabi);

},3000);




setTimeout(function(){
        //ClaimManagement.sol
        var claimContractSource = fs.readFileSync("ClaimManagement.json");
        var claimContract = JSON.parse(claimContractSource)["contracts"];
        var claimabi = JSON.parse(claimContract["ClaimManagement.sol:ClaimManagement"].abi);
        console.log("************** pushing ClaimManagement contract **********");
        pushContractToDB(solidityFileList[2], solidityJsonFileList[2], contractNameList[2], claimContractAddress, claimabi);
},5000);



setTimeout(function(){
    //insurance.sol
    var insuranceContractSource = fs.readFileSync("Insurance.json");
    var insuranceContract = JSON.parse(insuranceContractSource)["contracts"];
    var insuranceabi = JSON.parse(insuranceContract["Insurance.sol:Insurance"].abi);
    console.log("************** pushing Insurance contract **********");
    pushContractToDB(solidityFileList[3], solidityJsonFileList[3], contractNameList[3], insuranceContractAddress, insuranceabi);

},7000);