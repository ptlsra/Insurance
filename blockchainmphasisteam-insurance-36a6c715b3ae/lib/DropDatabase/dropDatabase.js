/**
 * Script to drop mongodb database
 */
var log4js = require('log4js');
var logger = log4js.getLogger('dropDatabase.js');
var MongoClient = require('mongodb').MongoClient;
var fs = require("fs");

/**
 * Read app configuration
 */
let configRawData = fs.readFileSync('config.json');
let configData = JSON.parse(configRawData);

var mongodb_ip = configData.mongoIp;
var mongodb_port = configData.mongoPort;
logger.level = configData.logLevel;


/**
 * method to drop multiple databases
 * @param {JSONArray} databaseList 
 */
function dropDatabasesAndCollections(databaseList){
    logger.debug("dropDatabases");
    //loop through databaseList and drop
    for(let index = 0; index < databaseList.length; index++){
        var databaseObject  = databaseList[index];
        dropDatabase(databaseObject);
    }
}

/**
 * method to drop single database
 * @param {JSONObject} database
 */
function dropDatabaseAndCollectionList(databaseObject) {
    logger.info("dropDatabase");
    try {
        logger.debug("database : " + JSON.stringify(databaseObject));
        logger.debug("databaseName : "+databaseObject.databaseName);
        logger.debug("collectionList : "+databaseObject.collectionList);

        //loop through the collectionList and delete
        for(let index = 0 ; index < databaseObject.collectionList.length; index++){
            logger.info("dropping collection : "+databaseObject.collectionList[index]);
            dropByCollection(databaseObject.databaseName, databaseObject.collectionList[index]);
        }

    } catch (e) {
        logger.error("Error in dropDatabase : " + e);
    }
}


/**
 * 
 * @param {databaseName} databaseName 
 * @param {collectionName} collectionName 
 */
function dropByCollection(databaseName, collectionName) {
    logger.info("drop");
    try {
        logger.debug("databaseName : " + databaseName);
        logger.debug("mongoIP : " + mongodb_ip);
        logger.debug("mongoPort : " + mongodb_port);

        //connect to mongodb database
        var databaseUrl = "mongodb://" + mongodb_ip + ":" + mongodb_port + "/" + databaseName;
        logger.debug("databaseUrl : " + databaseUrl);
        MongoClient.connect(databaseUrl, function (err, db) {
            //delete collection
            if (err) throw err;
            let connectionStatus = db.isConnected;
            logger.debug("Connection status : " + connectionStatus);
            if (typeof connectionStatus !== 'undefined') {
                db.collection(collectionName).drop(function (err, delOK) {
                    if (err) throw err;
                    if (delOK) console.log("Collection deleted");
                    logger.warn("Closing database connection");
                    db.close();
                });
            } else {
                logger.warn("Database not found.");
            }
        });
    } catch (e) {
        logger.error("Error in drop : " + e);
    }
}


/**
 * 
 * @param {*} databaseName 
 */
function dropDatabase(databaseName) {
    logger.info("dropDB");
    logger.debug("databaseName : " + databaseName);
    logger.debug("mongoIP : " + mongodb_ip);
    logger.debug("mongoPort : " + mongodb_port);
    try {
        //connect to mongodb database
        var databaseUrl = "mongodb://" + mongodb_ip + ":" + mongodb_port + "/" + databaseName;
        logger.debug("databaseUrl : " + databaseUrl);
        MongoClient.connect(databaseUrl, function (err, db) {
            if (err) throw err;
            //delete database
            let connectionStatus = db.isConnected;
            logger.debug("Connection status : "+connectionStatus );
            if(typeof connectionStatus !== 'undefined'){
                db.dropDatabase();
                logger.debug("Database : " + databaseName + " dropped");
                logger.warn("Closing db connection");
            }else{
                logger.warn(" database not found.");
            }
            db.close();
        });
    } catch (e) {
        logger.error("Error in dropDatabase : " + e);
    }
}


/**
 * 
 * @param {*} databaseList 
 */
function dropDatabases(databaseList){
    logger.info("dropDatabase");
    logger.debug("databaseList : "+JSON.stringify(databaseList));

    logger.debug("mongoIP : " + mongodb_ip);
    logger.debug("mongoPort : " + mongodb_port);

    for(let index=0; index<databaseList.length; index++){

        //drop database at index
        dropDatabase(databaseList[index]);
    }
}

//dropDatabase("mbroker");

/*
var databaseO = {
    databaseName : "banktxndb",
    collectionList : [
        "customers"
    ]
}
*/

//drop("bankdb", "customers");

module.exports.dropDatabasesAndCollections = dropDatabasesAndCollections;
module.exports.dropDatabaseAndCollectionList = dropDatabaseAndCollectionList;
module.exports.dropDatabases = dropDatabases;
module.exports.dropDatabase = dropDatabase;