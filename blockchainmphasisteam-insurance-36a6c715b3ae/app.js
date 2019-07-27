
// required modules
var fs = require("fs");
var Web3 = require('web3-quorum');
var cors = require('cors');
var PDFDocument = require('pdfkit');
var log4js = require('log4js');
var logger = log4js.getLogger('app.js');
var morganLogger = require('morgan');

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
app.use(morganLogger('dev'));


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
var ipfsIpAddress = configData.ipfsIp;

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


// mongodb url for api's

var claimListDBUrl = "mongodb://"+mongoIp+":"+mongoPort+"/insurance_claimlist_db";
var claimListDB;


MongoClient.connect(claimListDBUrl, function(err, claimListDBTemp) {
    claimListDB = claimListDBTemp;
});


var mongoUrl = "mongodb://"+mongoIp+":"+mongoPort+"/";

var insuranceTxnsDBurl = mongoUrl+companyName+"_txns";
var insuranceTxnsDB;
MongoClient.connect(insuranceTxnsDBurl, function(err, insuranceTxnsTempDB) {
    insuranceTxnsDB = insuranceTxnsTempDB;
});

var insuranceCustomerTxnsDBurl = mongoUrl+companyName+"_customer_txns";
var insuranceCustomerTxnsDB;
MongoClient.connect(insuranceCustomerTxnsDBurl, function(err, insuranceCustomerTxnsTempDB) {
    insuranceCustomerTxnsDB = insuranceCustomerTxnsTempDB;
});
//************************************************* Events ************************************************** */

/**
 * Registration Event.
 * @event
 */
var registrationEvent;
registrationEvent = deployedPolicyContract.RegisterCustomer({}, {fromBlock:'latest',toBlock:'latest'});
    //logger.debug(myEvent);
    registrationEvent.watch(function(error, result) {
            logger.debug("*************** Register Customer Event ***************");
            logger.debug(result);
            logger.debug("*********** prints args of result **********");
            logger.debug(result);
            var args = result.args;
            storeCustomerTransaction(args.userName, result.transactionHash, args.description,args.customerAddress);
            logger.debug("transaction sent to db");
    });


/**
 * Policy Creation Event.
 * @event
 */
var policyCreationEvent;
policyCreationEvent = deployedPolicyContract.CreatePolicy({}, {fromBlock:'latest',toBlock:'latest'});
    //logger.debug(myEvent);
    policyCreationEvent.watch(function(error, result) {
            logger.debug("*************** Policy Creation Event ***************");
            logger.debug(result);
            logger.debug("*********** prints args of result **********");
            logger.debug(result);
            var args = result.args;

            logger.debug("displaying loanId in number "+args.policyId);
            logger.debug(args.policyId.toNumber());

            storeCustomerTransaction(args.userName, result.transactionHash, args.description, args.customerAddress, args.policyId.toNumber());
            logger.debug("transaction sent to db");
    });

/**
 * Adding Dependent Event.
 * @event
 */
var addDependentEvent;
addDependentEvent = deployedPolicyContract.AddDependent({}, {fromBlock:'latest',toBlock:'latest'});
    //logger.debug(myEvent);
    addDependentEvent.watch(function(error, result) {
            logger.debug("*************** Add Dependent  Event ***************");
            logger.debug(result);
            logger.debug("*************** prints args of result ***************");
            logger.debug(result);
            var args = result.args;

            logger.debug("displaying loanId in number "+args.policyId);
            logger.debug(args.policyId.toNumber());

            storeCustomerTransaction(args.userName, result.transactionHash, args.description, args.customerAddress, args.policyId.toNumber());
            logger.debug("transaction sent to db");
    });

/**
 * Register broker event
 * @event
 * 
 */

var registerInsurance;

registerInsurance = deployedInsuranceContract.RegisterInsuranceCompany({}, {fromBlock:'latest', toBlock:'latest'});
    registerInsurance.watch(function(error, result){
        logger.debug("****************** register insurance event *********************");
        logger.debug(result);

        logger.debug("printing arguments : "+result.args);
        var args = result.args;
        //storeBrokerTransaction("marsh", result.transactionHash, args.description, "");
        if(args.insuranceAddress == insuranceAddress){
            storeInsuranceTransaction(companyName, result.transactionHash, args.description, "");
            logger.debug("transaction sent to db");
        }else{
            logger.debug("not my event :( ");
        }
    });

/**
 * SetPolicyOwner Event
 * @event
 * 
 */

var setPolicyOwner;

setPolicyOwner = deployedInsuranceContract.SetPolicyOwners({},{fromBlock:'latest', toBlock:'latest'});
    setPolicyOwner.watch(function(error, result){
        logger.debug("******************  set policy owner event *********************");
        logger.debug(result);
        logger.debug("printing arguments : "+result.args);
        var args = result.args;
        //storeBrokerTransaction("marsh", result.transactionHash, args.description, args.policyId.toNumber());
        if(args.insuranceAddress == insuranceAddress){
            storeInsuranceTransaction(companyName, result.transactionHash, args.description, args.policyId.toNumber());
            logger.debug("transaction sent to db");
        }else{
            logger.debug("not my event :( ");            
        }
       
    });


/**
 * 
 * Initial claim event
 * @event
 * 
 */
initialClaim = deployedClaimContract.InitialClaimEvent({}, {fromBlock:'latest', toBlock:'latest'});
initialClaim.watch(function(error, result){
    logger.info("initial claim event");
    logger.debug("printing arguments : "+result.args);
    insertClaimRecord(result.args.claimId);
});


/**
 * 
 * AcceptClaim event
 * @event
 * 
 * 
 */

var acceptClaim;

acceptClaim = deployedClaimContract.InitialClaimApproval({},{fromBlock:'latest', toBlock:'latest'});
acceptClaim.watch(function(error, result){
    logger.debug("******************  Accept Claim Event *********************");
    logger.debug(result);
    logger.debug("printing arguments : "+result.args);
    var args = result.args;
    //storeBrokerTransaction("marsh", result.transactionHash, args.description, "");
    if(args.fromAddress == insuranceAddress){
        storeInsuranceTransaction(companyName, result.transactionHash, args.description, args.policyId.toNumber());
        logger.debug("transaction sent to db");
    }else{
        logger.debug("not my event :( ");            
    }
});

/**
 * FinalClaimApprove event
 * @event
 * 
 */

var finalClaimApproval;
finalClaimApproval = deployedClaimContract.FinalClaimApproval({},{fromBlock:'latest', toBlock:'latest'});
finalClaimApproval.watch(function(error, result){
    logger.debug("****************** Final Claim Approval Event *********************");
    logger.debug(result);
    logger.debug("printing arguments : "+result.args);
    var args = result.args;
   // storeBrokerTransaction("marsh", result.transactionHash, args.description, "");
        if(args.fromAddress == insuranceAddress){
            storeInsuranceTransaction(companyName, result.transactionHash, args.description, args.policyId.toNumber());
            logger.debug("transaction sent to db");
        }else{
            logger.debug("not my event :( ");            
        }
});

/**
 * 
 * UpdateClaimStatus
 * @event
 * 
 */
var updateClaimStatus;
updateClaimStatus = deployedClaimContract.UpdateClaimStatus({}, {fromBlock:'latest', toBlock:'latest'});
updateClaimStatus.watch(function(error, result){
    logger.info("updateClaimStatus");
    logger.debug("result : "+result);
    updateClaimRecord(result.args.claimId, result.args.claimStatus);
});

/**
 * UploadEstimateDocument
 * @event
 */
uploadEstimateDocument = deployedClaimContract.UploadEstimateDocument({}, {fromBlock:'latest', toBlock:'latest'});

uploadEstimateDocument.watch(function(error, result){
    logger.info("uploadEstimateDocument");
    logger.debug("result : "+result);
    //new method to update claimlist_db
    //Just update estimateDocument key in the record
    //search the record by claimid
    updateEstimateDocument(result.args.claimId);
});


/**************************************** API Starts here ********************************************/


/**
 * API to register insurance
 * @function                    registerInsurance
 * @param       {string}        insuranceName     - name of the insurance company
 * 
 * @returns     {JSONObject}    insuranceInfo     - insurance info
 */

app.get('/registerInsurance', function (request, response) {
    logger.debug("************************* register insurance ****************************");

    try {
        var insuranceName = request.query.insuranceName;

        //var insuranceAddress = insuranceAddress;
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

        response.send(insuranceInfo);
    } catch (e) {
        logger.error("Error : " + e);
    }
});

/**
 * API to get list of broker from blockchain
 * @function                    getBrokerList
 * 
 * @returns     {JSONArray}     brokerList      -   returns list of brokerInfo (contains brokerName and brokerAddress)
 */
 app.get('/getBrokerList',function(request, response){
    logger.debug("********************* get list of brokers **********************************");

    var brokerAddressList   =   deployedInsuranceContract['getListOfBrokers']();

    logger.debug("printing broker list : "+brokerAddressList);
    var brokerList=[];
    for(let index = 0 ; index < brokerAddressList.length; index++){
        var brokerObject = deployedInsuranceContract['getBroker'](brokerAddressList[index]);

        var broker = {
            "brokerAddress":brokerObject[0],
            "brokerName":web3.toUtf8(brokerObject[1])
        }
        
        brokerList.push(broker);
    }


    //sending response to browser
    response.send(brokerList);

 });

/**
 * API to get list of all tpa's
 * @function                getTPAList
 * 
 * @returns     {JSONArray} tpaList             - list of all tpa's in the blockchain
 */
app.get('/getTPAList',function(request, response){
    logger.debug("************************* get list of tpa's ***************************");
    var tpaAddressList = deployedInsuranceContract['getListOfTPAs']();
    logger.debug("printing tpa list "+tpaAddressList);
    var tpaList = [];
    for(var index = 0; index < tpaAddressList.length; index++){
        var tpaObject = deployedInsuranceContract['getTPA'](tpaAddressList[index]);
        var tpa = {
            "tpaAddress":tpaObject[0],
            "tpaName":web3.toUtf8(tpaObject[1])
        }
        tpaList.push(tpa);
    }
    response.send(tpaList);
});


/**
 * API to get list of all insurance company
 * 
 * @function                getInsuranceList
 * 
 * @returns     {JSONArray} insuranceList       - lis of all insurance comapanies
 */
app.get('/getInsuranceList',function(request, response){
    logger.debug("************************* get list of Insurance companies ***************************");

    var insuranceAddressList = deployedInsuranceContract['getListOfInsuranceCompanies']();

    logger.debug("printing insuranceAddressList  "+insuranceAddressList);
    var insuranceList = [];

    for(var index = 0; index < insuranceAddressList.length; index++){
        var insuranceObject = deployedInsuranceContract['getInsuranceCompany'](insuranceAddressList[index]);

        var insurance = {
            "insuranceAddress":insuranceObject[0],
            "insuranceName":web3.toUtf8(insuranceObject[1])
        }
       insuranceList.push(insurance);
    }

    response.send(insuranceList);
});



/**
 * API to get broker info
 * @function                    getBrokerInfo
 * @returns     {JSONObject}    brokerInfo      - returns brokerName and brokerAddress
 */
app.get('/getBrokerInfo',function(request, response){
    logger.debug("********************** get broker info ****************************");
    var brokerAddress   = request.query.brokerAddress;

    var brokerObject    =   deployedInsuranceContract['getBroker'](brokerAddress);
    logger.debug("printing brokerObject : "+brokerObject);

    var brokerInfo = {
        brokerAddress:brokerObject[0],
        brokerName:web3.toUtf8(brokerObject[1])
    }

    response.send(brokerInfo);
});

/**
 * API to get policyOwners
 * @function                    getPolicyOwners
 * @param       {string}        policyId
 * 
 * @returns     {JSONObject}    policyOwners    - returns policyId and policyOwners
 * 
 */
app.get('/getPolicyOwners', function(request, response){
    logger.debug("********************** get policy owners ***********************");
    var policyId    =   request.query.policyId;

    var policyOwnerObject = deployedInsuranceContract['getPolicyOwners'](policyId);

    logger.debug("printing policyOwnerObject : "+policyOwnerObject);

    var policyOwners={
        policyId:policyId,
        insuranceAddress:policyOwnerObject[0],
        tpaAddress:policyOwnerObject[1],
        brokerAddress:policyOwnerObject[2]
    }

    response.send(policyOwners);
});


/**
 * API to set policy owners for a policy
 * 
 * @function                    setPolicyOwners
 * 
 * @param       {number}        policyId            -   policyId of the customer
 * @param       {string}        brokerAddress       -   brokerAddress
 * @param       {string}        tpaAddress          -   tpa address 
 * 
 * @returns     {JSONObject}    txId                -   transaction id
 */

app.post('/setPolicyOwners', function (request, response) {
    var policyId = request.query.policyId;
    var brokerAddress = request.query.brokerAddress;
    var tpaAddress = request.query.tpaAddress;

    try {
        var isError = false;
        if (isNaN(policyId)) {
            console.log(new Error("policyId is not a number"));
            isError = true;
        }

        if (isError == false) {

            logger.debug("policyId : " + policyId);
            logger.debug("brokerAddress : " + brokerAddress);
            logger.debug("tpaAddress : " + tpaAddress);

            logger.debug("********************** set policy owners ************************");
            web3.personal.unlockAccount(insuranceAddress, insuranceWalletPassword);
            var txId = deployedInsuranceContract['setPolicyOwners'](policyId, brokerAddress, insuranceAddress, tpaAddress, {
                from: insuranceAddress,
                gas: 400000
            });
            var jsonResponse = {
                txId: txId
            }

            response.send(jsonResponse);

        }else{

            response.send({
                "error":"Error in setPolicyOwners"
            });
        }
    } catch (e) {
        logger.error(e);
    }
});



/**
 * API to get customer Policy Details
 * 
 * @function                    getPolicyDetails
 * @param       {number}        policyId            -   policyId of the customer
 * @returns     {JSONObject}    policyDetails       -   returns policyDetails
 */
app.get('/getPolicyDetails',function(request, response){
    var policyId    =   request.query.policyId;

    logger.debug("********************* get customerPolicyDetails ***************************");
    var policyObject = deployedPolicyContract['getPolicy'](policyId, insuranceAddress);
    logger.debug("printing policyObject : "+policyObject);
    var policyOwnerStatus = deployedInsuranceContract['getPolicyOwnersStatus'](policyId);

    var customerAddress = policyObject[1];
    
    var customerDetailsObject = deployedPolicyContract['getCustomerDetails'](customerAddress);
    
    var customerName = customerDetailsObject[1];

    var policyOwners      = deployedInsuranceContract['getPolicyOwners'](policyId);

    //get names of policyOwners
    var brokerName = web3.toUtf8(deployedInsuranceContract['getCompanyName'](policyOwners[2]));
    var insuranceName = web3.toUtf8(deployedInsuranceContract['getCompanyName'](policyOwners[0]));
    var tpaName      = web3.toUtf8(deployedInsuranceContract['getCompanyName'](policyOwners[1]));


    var policyProviderObject = {
        brokerAddress : policyOwners[2],
        brokerName:brokerName,
        insuranceAddress: policyOwners[0],
        insuranceName:insuranceName,
        tpaAddress:policyOwners[1],
        tpaName:tpaName
    }

    var policyDetails = {
        policyId                :   policyId,
        policyHolderName        :   customerName,
        policyProviderAddress   :   policyObject[0],
        customerAddress         :   policyObject[1],
        policyValidity          :   policyObject[2],
        policyDocumentHash      :   web3.toUtf8(policyObject[3])+web3.toUtf8(policyObject[4]),
        timeStamp               :   policyObject[5],
        policyOwnerStatus       :   policyOwnerStatus,
        policyProviders         :   policyProviderObject
    }

    response.send(policyDetails);
});


/**
 * 
 * API to get customer/policyHolder's dependents
 * @function                    getDependents
 * @param       {number}        policyId            -   policyId of the customer
 * @returns     {JSONArray}     dependentList       -   list of all dependents
 */
app.get('/getDependents',function(request, response){
    var policyId    =   request.query.policyId;
    logger.debug("******************** get dependents ********************************");

    var dependentsObject   = deployedPolicyContract['getDependents'](policyId);

    logger.debug("printing dependents list : "+dependentsObject);
    logger.debug("converting all list objects to utf8 ");
    var dependentList   =   [];
    var dependentObject ;

    for(var index=0; index < dependentsObject[0].length; index++){


        //get dependent details
        var dependentDetailsObject  =   deployedPolicyContract['getDependentDetails'](dependentsObject[1][index]);

        logger.debug("printing age : "+dependentDetailsObject[1]);
        logger.debug("printing gender : "+dependentDetailsObject[2]);

        dependentObject = {
            dependentName:web3.toUtf8(dependentsObject[0][index]),
            dependentId:dependentsObject[1][index],
            age:dependentDetailsObject[1],
            gender:web3.toUtf8(dependentDetailsObject[2]),
            relation:web3.toUtf8(dependentDetailsObject[3])
        }

        dependentList.push(dependentObject);
    }

    var jsonResponse = {
        dependents:dependentList
    }

    response.send(jsonResponse);
});



/**
 * API to get customer policies
 * 
 * @function                    getCustomerPolicies
 * @param       {string}        customerAddress     - walletAddress of the customer
 * @returns     {JSONObject}    customerPolicies    - list of policies taken customer
 * 
 */
app.get('/getCustomerPolicies',function(request, response){
    var customerAddress     =   request.query.customerAddress;

    logger.debug("************************ get customer policies **************************");
    var customerPoliciesObject = deployedPolicyContract['getCustomerPolicies'](customerAddress);
    logger.debug("printing customer policies : "+customerPoliciesObject);
    
    /*
    var customerPolicies = {
        customerAddress:customerPoliciesObject[0],
        policies:customerPoliciesObject[1]
    }
    */
    var policyList = [];

    for(var index=0; index < customerPoliciesObject[1].length; index++){
        var policyObject = deployedPolicyContract['getPolicy'](customerPoliciesObject[1][index], insuranceAddress);
        logger.debug("printing policyObject : "+policyObject);
        var policyOwnerStatus = deployedInsuranceContract['getPolicyOwnersStatus'](policyId);

        var policyDetails = {
            policyId                :   customerPoliciesObject[1][index],
            policyValidity          :   policyObject[2],
            policyDocumentHash      :   (web3.toUtf8(policyObject[3])+web3.toUtf8(policyObject[4])),
            timestamp               :   policyObject[5],
            policyOwnerStatus       :   policyOwnerStatus
        }

        policyList.push(policyDetails);
    }

    var customerPolicies = {
        policies:policyList.reverse()
    }

    response.send(customerPolicies);
});



/**
 * 
 * API to get All Customer Policies
 * 
 * @function                    getAllCustomerPolicies
 * 
 * @returns     {JSONArray}     customerPolicies        -  all customer policies
 */

app.get('/getAllCustomerPolicies',function(request, response){
    logger.debug("****************** get all customer policies *********************");

    var policiesObject = deployedInsuranceContract['getInsurancePolicies'](insuranceAddress);
    var policies = [];
    for(var index = 0; index < policiesObject.length; index++){
        var policyId = policiesObject[index];

        var policyObject = deployedPolicyContract['getPolicy'](policyId, insuranceAddress);
        logger.debug("printing policyObject : "+policyObject);
        var policyOwnerStatus = deployedInsuranceContract['getPolicyOwnersStatus'](policyId);

        var policyHolderAddress = policyObject[1];
        
        var policyHolderDetails = deployedPolicyContract['getCustomerDetails'](policyHolderAddress);
        
        var insuredAmount = policyHolderDetails[3];
        var customerName = policyHolderDetails[1];
        var policyDetails = {
            policyId                :   policyId,
            policyValidity          :   policyObject[2],
            policyDocumentHash      :   (web3.toUtf8(policyObject[3])+web3.toUtf8(policyObject[4])),
            timestamp               :   policyObject[5],
            sumInsured              :   insuredAmount,
            customerName            :   customerName,
            policyOwnerStatus       :   policyOwnerStatus,
            policyHolderAddress     :   policyHolderAddress
        }

        policies.push(policyDetails);
    }

    response.send(policies.reverse());
});


/**
 * API to accept claim (initial claim approval)
 * 
 * @function                    acceptClaim
 * 
 * @param       {claimId}       claimId
 * @param       {policyId}      policyId
 * 
 * @returns     {JSONObject}    txId
 */
app.post('/acceptClaim', function (request, response) {
    logger.debug("************************ accept claim ********************************");

    try {
        var claimId = request.query.claimId;
        var policyId = request.query.policyId;

        var isError = false;
        if (isNaN(claimId)) {
            console.log(new Error("claimId is not a number"));
            isError = true;
        } else {
            if (isNaN(policyId)) {
                console.log(new Error("policyId is not a number"));
                isError = true;
            }
        }
        if (isError == false) {
            web3.personal.unlockAccount(insuranceAddress, insuranceWalletPassword);

            var txId = deployedClaimContract['initialClaimApproval'](claimId, policyId, insuranceAddress, insuranceContractAddress, {
                from: insuranceAddress,
                gas: 4000000
            });
            var jsonResponse = {
                txId: txId
            }

            response.send(jsonResponse);
        }else{
            response.send({
                "error":"Error in acceptClaim"
            });
        }
    } catch (e) {
        logger.error("Error : " + e);
    }
});


/**
 * API for final approval of claim
 * 
 * @function                    approveClaim
 * @param       {claimId}       claimId         -   claimId of the patient
 * @returns     {JSONObject}    txId            -   txId
 */
app.post('/approveClaim',function(request, response){
    logger.debug("************************ approve claim ****************************");
try{
    var claimId = request.query.claimId;
    var isError = false;

    if(isNaN(claimId)){
        console.log(new Error("claimId is not a number"));
        isError = true;
    }
    logger.debug("claimId : "+claimId);
    if(isError == false){
    web3.personal.unlockAccount(insuranceAddress, insuranceWalletPassword);

    var txId    =   deployedClaimContract['finalClaimApproval'](claimId, insuranceAddress,{from: insuranceAddress, gas:4000000});
    var jsonResponse = {
        txId:txId
    }
    response.send(jsonResponse);
}else{
    response.send({
        "error":"Error in approveClaim"
    });
}
}catch(e){
    logger.error("Error : "+e);
}
});




/**
 * 
 * API to get list of claims applied
 * 
 * @function                    getClaimListForInsurance
 * 
 * @returns     {JSONArray}     claimList
 * 
 */
app.get('/getClaimListForInsurance',function(request, response){
    logger.debug("******************* get claim list for insurance ********************");

    logger.debug("**************** Get Claim Request List ******************");
    claimListDB.collection("claimlist").find().toArray(function(err, result) {
        if (err) throw err;
        logger.debug(result);
        return response.send(result.reverse());
    });

});



/**
 * API to get customer/policy holder details
 * 
 * @function                    getCustomerDetails
 * @param       {string}        customerAddress      -   wallet address of the customer
 * @returns     {JSONObject}    customerDetails      -   customerAddress, customerName, userName, sumInsured, tenure
 */
app.get('/getCustomerDetails',function(request, response){
    logger.debug("**************************** get customer details *********************************");

    var customerAddress     =   request.query.customerAddress;
    logger.debug("printing customer address : "+customerAddress);

    var customerObject = deployedPolicyContract['getCustomerDetails'](customerAddress);
    
    logger.debug("printing customer Object : "+customerObject);

    var userName = customerObject[2];

    var MongoClient = require('mongodb').MongoClient;
    
    var url = mongoUrl+"marsh";
   // var url = "mongodb://172.21.80.81:27017/"+"marsh";
    try{
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            db.collection(userName).find().toArray(function(err, userObject) {
            if (err) throw err;
            logger.debug("Printing user Object : "+userObject);
                    var customerDetails = {
                        "customerAddress":customerObject[0],
                        "customerName":customerObject[1],
                        "username":customerObject[2],
                        "sumInsured":customerObject[3],
                        "tenure":customerObject[4],
                        "emailId":customerObject[2],
                        "scheme":customerObject[5],
                        "dob":"",
                    }
                    response.send(customerDetails);
            });
        });
    }catch(Exception){
        logger.debug("error in fetching data");
    }
});


/**
 * API to get initial claimDetails
 * 
 * @function                    getInititalClaimDetails 
 * @param       {number}        claimId                     - claimId of the patient
 * 
 * @returns     {JSONObject}    initialClaimDetails         - initital claim details of the customer
 */
app.get('/getInitialClaimDetails',function(request, response){
    logger.debug("************************** initial claim details *********************************");
    var claimId = request.query.claimId;
    //fetch data from blockchain
    var initialClaimObject = deployedClaimContract['getInitialClaimDetails'](claimId);
    logger.debug("printing initial claim details : "+initialClaimObject);
    var initialClaimDetails = {
        patientAddress:initialClaimObject[0],
        policyId:initialClaimObject[1],
        timestamp:initialClaimObject[2],
        claimEstimate:initialClaimObject[3],
        estimateDocument:web3.toUtf8(initialClaimObject[4])+web3.toUtf8(initialClaimObject[5]),
        initiallyApprovedBy:initialClaimObject[6]
    }

    response.send(initialClaimDetails);
});


/**
 * 
 * API to get claim details
 * 
 * @function                        getClaimDetails
 * @param           {number}        claimId                 - claimId of the patient
 * @returns         {JSONObject}    claimDetails            - claim details of the patient
 */

app.get('/getClaimDetails', function(request, response){
    logger.debug("**************************** get claim details of the patient **********************");
    var claimId = request.query.claimId;
    var claimDetailsObject = deployedClaimContract['getClaimDetails'](claimId);
    var claimOwnersObject = deployedClaimContract['getClaimOwners'](claimId);

    logger.debug("printing claim details : "+JSON.stringify(claimDetailsObject));
    logger.debug("printing owner details : "+JSON.stringify(claimOwnersObject));


    var bill;
    logger.debug("printing length "+claimDetailsObject[1]);
    if(claimDetailsObject[1] == 0){
        bill = "notFound"
    }else{
        bill = (web3.toUtf8(claimDetailsObject[1][0])+web3.toUtf8(claimDetailsObject[2][0]));
    }


    var claimDetails = {
        claimStatus: web3.toUtf8(claimDetailsObject[0]),
        bill:bill,
        claimAmount:claimDetailsObject[3],
        brokerAddress:claimOwnersObject[0],
        insuranceAddress:claimOwnersObject[1],
        tpaAddress:claimOwnersObject[2]
    }

    logger.debug("printing claim details : "+claimDetails);
    response.send(claimDetails);
});





/*********************** Database API's *********************************/


/**
 * function to store insurance transactions
 * @function     storeInsuranceTransaction
 */

function storeInsuranceTransaction(companyName, tx_id, description, accountAddress, policyId) {
    logger.debug("****************** storing transactions for insurance *******************");

    try {
        // storing transaction record for a customer into mongodb 
        // collection is by user_name i.e it can be any emailId( but it is unique)
        logger.debug("***************** store transactions to database *******************");
        var date_time;
        /**
        var isError = false;

        if (isNaN(policyId)) {
            console.log(new Error("policyId is not a number"));
        }

        if (isError == false) {
            **/

        // get blocktimestamp by fetching blockdata
        logger.debug("printing tx_id" + tx_id);
        logger.debug("fetching transaction data  ");
        var transactionData = web3.eth.getTransaction(tx_id);

        logger.debug(transactionData);

        logger.debug("fetching block data  ");
        var blockNumber = transactionData.blockNumber;

        var blockData = web3.eth.getBlock(blockNumber);
        logger.debug("fetching block timestamp  ");
        date_time = blockData.timestamp;

        logger.debug("printing block timestamp   " + date_time);

        let promiseA = new Promise((resolve, reject) => {
            let wait = setTimeout(() => {
                logger.debug("************ connected to mongodb client at localhost *************");
                logger.debug("********** storing record **********");
                var myobj = {
                    transactionId: tx_id,
                    dateTime: date_time,
                    description: description,
                    policyId: policyId
                };

                var collectionName = companyName + "txns";
                insuranceTxnsDB.collection(collectionName).insertOne(myobj, function (err, res) {
                    if (err) throw err;
                    logger.debug("Transaction record inserted ....");
                });
            });
        }, 3000);
                   
    //}
    } catch (e) {
        logger.error("Error in storeInsuranceTransaction");
    }
}


/**
 * 
 * @function  storeCustomerTransaction
 * 
 * @param {string} user_name 
 * @param {string} tx_id 
 * @param {string} description 
 * @param {string} accountAddress 
 * @param {number} policyId 
 */


function storeCustomerTransaction(user_name, tx_id, description, accountAddress, policyId) {
    // storing transaction record for a customer into mongodb 
    // collection is by user_name i.e it can be any emailId( but it is unique)

    try {
        logger.debug("***************** store transactions to database *******************");

        /** 
        var isError = false;

        if (isNaN(policyId)) {
            console.log(new Error("policyId is not a number"));
            isError = true;
        }
        **/
        //if (isError == false) {
            var date_time;

            // get blocktimestamp by fetching blockdata
            logger.debug("printing tx_id" + tx_id);
            logger.debug("fetching transaction data  ");
            var transactionData = web3.eth.getTransaction(tx_id);

            logger.debug(transactionData);

            logger.debug("fetching block data  ");
            var blockNumber = transactionData.blockNumber;

            var blockData = web3.eth.getBlock(blockNumber);
            logger.debug("fetching block timestamp  ");
            date_time = blockData.timestamp;

            logger.debug("printing block timestamp   " + date_time);

            // get name of the customer
            var customerName;

            logger.debug("printing account address : " + accountAddress);

            var result = (deployedPolicyContract['getCustomerDetails'](accountAddress));
            logger.debug("printing customer details : " + result);
            customerName = result[1];

            logger.debug("printing customerName : " + customerName);

            let promiseA = new Promise((resolve, reject) => {
                let wait = setTimeout(() => {
                    logger.debug("************ connected to mongodb client at localhost *************");
                    logger.debug("********** storing record **********");
                    var myobj = {
                        transactionId: tx_id,
                        dateTime: date_time,
                        description: description,
                        customerName: customerName,
                        policyId: policyId
                    };
                    var collectionName = user_name + "txns";
                    insuranceCustomerTxnsDB.collection(collectionName).insertOne(myobj, function (err, res) {
                        if (err) throw err;
                        logger.debug("Transaction record inserted ....");
                    });
                });
            }, 3000);
            /*
        } else {
            console.log("Error in storeCustomerTransaction");
        }
        */
    } catch (e) {
        logger.error("Error in storeCustomerTransaction");
    }
}



/**
 * Get Customer Transactions By PolicyId
 * @function                getCustomerTransactionsByPolicyId
 * @param       {string}    userName            - userName of the customer
 * @param       {number}    policyId            - policyId of the customer
 * @returns     {JSONArray} transactionList     - list of customer transactions by loanId 
 */
app.get('/getCustomerTransactionsByPolicyId',function(request, response){
    logger.debug("******************** get transactions for customer by policyId ****************");
    var userName = request.query.userName;
    var policyId   = parseInt(request.query.policyId);
    logger.debug("userName is "+userName);
    logger.debug("loan id is "+policyId);
    var collectionsName = userName+"txns"
    logger.debug("printing collections name "+collectionsName);

      var query = {policyId:policyId};
      insuranceCustomerTxnsDB.collection(collectionsName).find(query).toArray(function(err, transactionList) {
        if (err) throw err;
        logger.debug(transactionList);
        return response.send(transactionList.reverse());
      });
});


/**
 * Get All Customer Transactions
 * @function                    getAllCustomerTransactions
 * @returns     {JSONArray}     allTransactions             - list of all customer transactions
 * 
 */
app.get('/getAllCustomerTransactions',function(request, response){
    logger.debug("*********************** get all customer transactions *************************");
        var allTransactions = [];

        insuranceCustomerTxnsDB.listCollections().toArray(function(err, result) {
          if (err) throw err;
          logger.debug(result);
          //db.close();
          for(var index=0; index<result.length; index++){
              var collectionsName = result[index].name;
              //logger.debug("printing collections name"+collectionsName);
              insuranceCustomerTxnsDB.collection(collectionsName).find({}).toArray(function(err, record) {
                    if (err) throw err;
                    allTransactions.push(record.reverse());
                    
                });
            }

            let promiseA = new Promise((resolve, reject) => {
                let wait = setTimeout(() => {
                
                response.setHeader('Content-Type', 'application/json');
                response.send(allTransactions);
                }, 3000)
            })
        });
});


/**
 * 
 * @param {*} claimId 
 * @param {*} claimStatus 
 */
function updateClaimRecord(claimId, claimStatus) {
    //update claim record

    try {
        logger.info("updateClaimRecord");

        var isError = false;

        if (isNaN(claimId)) {
            console.log(new Error("claimId is not a number"));
            isError = true;
        }

        if (isError == false) {
            var query = {
                claimId: claimId.toNumber()
            };

            var initialClaimObject = deployedClaimContract['getInitialClaimDetails'](claimId);
            var initiallyApprovedBy = initialClaimObject[6];
            var approverName = deployedInsuranceContract['getCompanyName'](initialClaimObject[6]);

            var newValues = {
                $set: {
                    claimStatus: web3.toUtf8(claimStatus),
                    initiallyApprovedBy: initiallyApprovedBy,
                    approverName: web3.toUtf8(approverName)
                }
            }

            claimListDB.collection("claimlist").updateOne(query, newValues, function (err, doc) {
                if (err) throw err;
                logger.debug("claimlist_db updated ..");
            });
        } else {
            console.log("Error in updateClaimRecord");
        }
    } catch (e) {
        logger.debug("Error in updateClaimRecord");
    }
}


/*
function updateApproverInfo(claimId) {
    //method to update initial approver info
    //update approver name and approver address
    //
    logger.info("updateApproverInfo");
    logger.debug("claimId : " + claimId);

    var initialClaimObject = deployedClaimContract['getInitialClaimDetails'](claimId);
    initiallyApprovedBy = initialClaimObject[6];
    var approverName = deployedInsuranceContract['getCompanyName'](initialClaimObject[6]);

    var query = { claimId: claimId.toNumber() };
    var newValues = {
        $set: {
            initiallyApprovedBy: initiallyApprovedBy,
            approverName: approverName
        }
    }

    claimListDB.collection("claimlist").updateOne(query, newValues, function (err, doc) {
        if (err) throw err;
        logger.debug("claimlist_db updated ..");
    });

}
*/


function updateEstimateDocument(claimId) {

    //method to update claimlist_db
    //Just update estimateDocument key in the record
    //search the record by claimid
    try {
        logger.info("updateEstimateDocument");
        logger.debug("claimId : " + claimId);

        var isError = false;
        if (isNaN(claimId)) {
            console.log(new Error("claimId is not a number"));
            isError = true;
        }

        if (isError == false) {
            var query = {
                claimId: claimId.toNumber()
            };
            var initialClaimObject = deployedClaimContract['getInitialClaimDetails'](claimId);
            estimateDocument = web3.toUtf8(initialClaimObject[4]) + web3.toUtf8(initialClaimObject[5]);

            var newValues = {
                $set: {
                    estimateDocument: estimateDocument

                }
            }

            claimListDB.collection("claimlist").updateOne(query, newValues, function (err, doc) {
                if (err) throw err;
                logger.debug("claimlist_db updated ..");
            });
        } else {
            console.log("Error in updateEstimateDocument");
        }
    } catch (e) {
        logger.error("Error in updateEstimateDocument");
    }
}



/**
 * 
 * @param {*} claimId
 */
function insertClaimRecord(claimId) {
    logger.info("insertClaimRecord");

    try {

        var isError = false;
        if (isNaN(claimId)) {
            console.log(new Error("claimId is not a number"));
            isError = true;
        }

        if (isError == false) {
            var initialClaimObject = deployedClaimContract['getInitialClaimDetails'](claimId);
            console.log("printing initial claim details : " + initialClaimObject);
            var claimDetailsObject = deployedClaimContract['getClaimDetails'](claimId);
            var policyId = initialClaimObject[1];
            //get customerName and patientName
            var policyObject = deployedPolicyContract['getPolicy'](policyId, marshAddress);
            var customerAddress = policyObject[1];
            var customerObject = deployedPolicyContract['getCustomerDetails'](customerAddress);
            var customerName = customerObject[1];
            var patientObject = deployedHospitalContract['getPatientDetails'](initialClaimObject[0]);

            var approverName = web3.toUtf8(deployedInsuranceContract['getCompanyName'](initialClaimObject[6]));

            console.log("printing patientObject  : " + JSON.stringify(patientObject));
            var patientName = patientObject[2];

            var initialClaimDetails = {
                claimId: claimId.toNumber(),
                policyHolderName: customerName,
                patientName: patientName,
                claimStatus: web3.toUtf8(claimDetailsObject[0]),
                patientAddress: initialClaimObject[0],
                policyId: initialClaimObject[1].toNumber(),
                timestamp: initialClaimObject[2].toNumber(),
                claimEstimate: initialClaimObject[3].toNumber(),
                estimateDocument: web3.toUtf8(initialClaimObject[4]) + web3.toUtf8(initialClaimObject[5]),
                initiallyApprovedBy: initialClaimObject[6],
                approverName: approverName
            }

            //push the object into mongodb 
            var query = {
                claimId: claimId.toNumber()
            };
            var obj = initialClaimDetails;
            claimListDB.collection("claimlist").update(query, obj, {
                upsert: true
            }, function (err, doc) {
                if (err) throw err;
                logger.debug("Record inserted/updated ..");
            });
        } else {
            console.log("Error in insertClaimRecord");
        }
    } catch (e) {
        logger.error("Error in insertClaimRecord");
    }
}

/**
 * 
 * API to get file from ipfs
 * 
 */
app.get('/ipfs', function (req, res) {
    logger.info("ipfs");
    var fileHash = req.query.fileHash;

    //create and ipfs url and return
    logger.debug("fileHash : "+fileHash);

    /*
    ipfs.files.cat(fileHash, function (err, file) {
        if (err) throw err;
        res.send(file);
    });
    */
   res.send({
        ipfsUrl : "http://"+ipfsIpAddress+":8080/ipfs/"+fileHash
    });
});


//assuming app is express Object.
app.get('/index',function(req,res){
	res.sendFile(path.join(__dirname+'/UI/index.html'));
	//res.sendFile('/AirportDashboard/index.html');

});

app.use('/', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    var message ={
        message:"API service for Marsh on Quorum"
    }
    res.send(message);
});

// ************** app runs at 0.0.0.0 at port 5004 *****************************
app.listen(appPort,appIp,function () {
    logger.debug("Application started and listening at "+appIp+"Port : "+appPort);
})







