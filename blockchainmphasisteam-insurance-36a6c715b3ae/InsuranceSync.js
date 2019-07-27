console.log("Quorum API for Group Insurance");

/**
 * @file    InsuranceAPI version 0.1
 * @file    API Runs at http://localhost:5004
 * @file    API for Insurance Company to invoke and query smart contract. This api works with only quorum blockchain. Platform will be expanded later. :)
 */



// required modules
var fs = require("fs");
var Web3 = require('web3-quorum');
var cors = require('cors');
var xhr = require('request');
var PDFDocument = require('pdfkit');


//mongod for local storage
// NOTE: install mongodb@2.2.33 
// do --> npm install mongodb@2.2.33 --save

var MongoClient = require('mongodb').MongoClient;
const abiDecoder = require('abi-decoder');
const express = require('express');

// md5 for generating hash
var md5 = require('md5');
const app = express();

// express file upload library
const fileUpload = require('express-fileupload');

var bodyParser = require('body-parser');
app.use(bodyParser.json());

// setting cors option for app
app.use(cors());
app.use(fileUpload());
app.options("*",cors());

// ipfs javascript http-client library
var ipfsAPI = require('ipfs-api');

//ipfs connection
var ipfs = ipfsAPI('/ip4/13.56.107.236/tcp/5001');
console.log("Starting API ");

// connecting to web3 provider
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:22001"));
var appPort=5000;
// contracts
var policyContractAddress       = "0x9eb8d7e5bc8b742c5984655a352417b4af5c8579";
var insuranceContractAddress    = "0xbc8946145b67c12ecc76d5885dd20d28e53482c6";
var claimContractAddress        = "0x0cc912232a8dd54dadfc2c61d9a634da93fe9ada";
var hospitalContractAddress     = "0x6e59372e7267648d830a1d0843951a8c347963e1";
//reading abi from file




//read contract addresses from contractsConfig.json
let rawdata = fs.readFileSync('../contractConfig.json');  
let contractsData = JSON.parse(rawdata);
console.log(JSON.stringify(contractsData));

policyContractAddress = contractsData.policyContract;
insuranceContractAddress = contractsData.insuranceContract;
claimContractAddress = contractsData.claimContract;
hospitalContractAddress = contractsData.hospitalContract;


//Policy.sol
var policyContractSource = fs.readFileSync("Policy.json");
var policyContract = JSON.parse(policyContractSource)["contracts"];
var policyabi = JSON.parse(policyContract["Policy.sol:Policy"].abi);
const deployedPolicyContract = web3.eth.contract(policyabi).at(String(policyContractAddress));

//Insurance.sol
var insuranceContractSource = fs.readFileSync("Insurance.json");
var insuranceContract = JSON.parse(insuranceContractSource)["contracts"];
var insuranceabi = JSON.parse(insuranceContract["Insurance.sol:Insurance"].abi);
const deployedInsuranceContract = web3.eth.contract(insuranceabi).at(String(insuranceContractAddress));


//ClaimManagement.sol
var claimContractSource = fs.readFileSync("ClaimManagement.json");
var claimContract = JSON.parse(claimContractSource)["contracts"];
var claimabi = JSON.parse(claimContract["ClaimManagement.sol:ClaimManagement"].abi);
const deployedClaimContract = web3.eth.contract(claimabi).at(String(claimContractAddress));


//Hospital.sol
var hospitalContractSource = fs.readFileSync("Hospital.json");
var hospitalContract = JSON.parse(hospitalContractSource)["contracts"];
var hospitalabi = JSON.parse(hospitalContract["Hospital.sol:Hospital"].abi);
const deployedHospitalContract = web3.eth.contract(hospitalabi).at(String(hospitalContractAddress));


//company Name
var companyName = "LifeInsurance"

let configRawData = fs.readFileSync('./config.json');  
let configData = JSON.parse(configRawData);


//marsh wallet address;


//var brokerName =   "marsh";

//tpa wallet address;
//var tpaAddress = "0x50bb02281de5f00cc1f1dd5a6692da3fa9b2d912";
var insuranceAddress = configData.insuranceWalletAddress;
var marshAddress = configData.brokerWalletAddress;
//insurance wallet address;
//var insuranceAddress = "0xcd5b17da5ad176905c12fc85ce43ec287ab55363"


var claimListDBUrl = "mongodb://localhost:27017/claimlist_db";
//var clientListDBUrl = "mongodb://localhost:27017/clientlist_db";
var claimListDB;

MongoClient.connect(claimListDBUrl, function(err, claimListDBTemp) {
    claimListDB = claimListDBTemp;
});


function syncClaimList(){

 console.log("******************* get claim list for insurance ********************");
    
    var claimListObject = deployedInsuranceContract['getClaimsForInsurance'](insuranceAddress);
    console.log("printing claimList for insurance "+JSON.stringify(claimListObject));
    var claimList=[];
    
    for(var index = 0; index < claimListObject.length; index++){
        var claimId = claimListObject[index];
        var initialClaimObject = deployedClaimContract['getInitialClaimDetails'](claimId);
        console.log("printing initial claim details : "+initialClaimObject);
        var claimDetailsObject = deployedClaimContract['getClaimDetails'](claimId);
        var policyId = initialClaimObject[1];
        //get customerName and patientName
        var policyObject   = deployedPolicyContract['getPolicy'](policyId, marshAddress);
        var customerAddress = policyObject[1];
        var customerObject = deployedPolicyContract['getCustomerDetails'](customerAddress);
        var customerName = customerObject[1];
        var patientObject = deployedHospitalContract['getPatientDetails'](initialClaimObject[0]);

        var approverName = web3.toUtf8(deployedInsuranceContract['getCompanyName'](initialClaimObject[6]));

        console.log("printing patientObject  : "+JSON.stringify(patientObject));
        var patientName = patientObject[2];

        var initialClaimDetails = {
            claimId:claimId.toNumber(),
            policyHolderName:customerName,
            patientName:patientName,
            claimStatus:web3.toUtf8(claimDetailsObject[0]),
            patientAddress:initialClaimObject[0],
            policyId:initialClaimObject[1].toNumber(),
            timestamp:initialClaimObject[2].toNumber(),
            claimEstimate:initialClaimObject[3].toNumber(),
            estimateDocument:web3.toUtf8(initialClaimObject[4])+web3.toUtf8(initialClaimObject[5]),
            initiallyApprovedBy:initialClaimObject[6],
            approverName:approverName
        }


	//push the object into mongodb 
        var query = {claimId:claimId.toNumber()};
        var obj = initialClaimDetails;
        claimListDB.collection("claimlist").update(query,obj,{upsert: true}, function(err,doc){
                 if (err) throw err;
                 console.log("Record inserted/updated ..");
        })



    }
}



setInterval(function(){
    console.log("*************** starting syncClaimList **************");
    syncClaimList();
},10000);
