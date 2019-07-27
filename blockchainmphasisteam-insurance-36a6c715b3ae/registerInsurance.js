// required modules
var fs = require("fs");
var Web3 = require('web3-quorum');
var cors = require('cors');
var PDFDocument = require('pdfkit');
var log4js = require('log4js');
var logger = log4js.getLogger('app.js');
//ipfs connection

//mongod for local storage
// NOTE: install mongodb@2.2.33 
// do --> npm install mongodb@2.2.33 --save
var MongoClient = require('mongodb').MongoClient;
const express = require('express');

const app = express();

// express file upload library
const fileUpload = require('express-fileupload');

var bodyParser = require('body-parser');
app.use(bodyParser.json());

// setting cors option for app
app.use(cors());
app.use(fileUpload());
app.options("*",cors());

/**
 * UI integration
 */
// setting path for UI
var pathval=__dirname + "/UI/";
console.log(pathval);
app.set('views',pathval);


app.use(express.static(pathval));

// ipfs javascript http-client library
var ipfsAPI = require('ipfs-api');

/**
 * 
 * Read configuration from config file
 */
let configRawData = fs.readFileSync('./config.json');
let configData = JSON.parse(configRawData);

var companyName = configData.companyName;
var insuranceAddress = configData.insuranceWalletAddress;
var insuranceWalletPassword = configData.insuranceWalletPassword;
var appPort = configData.appPort;
var web3Url = configData.web3Url;
var mongoIp = configData.mongoIp;
var mongoPort = configData.mongoPort;
var appIp = configData.appIp;
var marshAddress = configData.brokerWalletAddress;

logger.level = configData.logLevel;

logger.debug("Starting API ");

// connecting to web3 provider
var web3 = new Web3(new Web3.providers.HttpProvider(web3Url));
//reading abi from file

//read contract addresses from contractsConfig.json
let rawdata = fs.readFileSync('./contractConfig.json');
let contractsData = JSON.parse(rawdata);
logger.debug(JSON.stringify(contractsData));

var policyContractAddress = contractsData.policyContract;
var insuranceContractAddress = contractsData.insuranceContract;
var claimContractAddress = contractsData.claimContract;
var hospitalContractAddress = contractsData.hospitalContract;


//Insurance.sol
var insuranceContractSource = fs.readFileSync("Insurance.json");
var insuranceContract = JSON.parse(insuranceContractSource)["contracts"];
var insuranceabi = JSON.parse(insuranceContract["Insurance.sol:Insurance"].abi);
const deployedInsuranceContract = web3.eth.contract(insuranceabi).at(String(insuranceContractAddress));




logger.info("registering insurance company");

var insuranceName = "healthinsurance";


var insuranceObject = deployedInsuranceContract['getInsuranceCompany'](insuranceAddress);

var insuranceNameTemp = web3.toUtf8(insuranceObject[1])

if(insuranceNameTemp == ""){
    logger.info("Insurance company not registered");

    web3.personal.unlockAccount(insuranceAddress, insuranceWalletPassword);

    var txId = deployedInsuranceContract['registerInsuranceCompany'](insuranceAddress, insuranceName, {
        from: insuranceAddress,
        gas: 400000
    });

    var insuranceInfo = {
        insuranceAddress: insuranceAddress,
        insuranceName: insuranceName,
        txId: txId
    }

    logger.debug("insuranceInfo : "+JSON.stringify(insuranceInfo));
}else{
    logger.info("Insurance company already registered");
}



