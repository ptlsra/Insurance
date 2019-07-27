var dropDatabase = require('./lib/DropDatabase/dropDatabase.js');
var log4js = require('log4js');
var fs = require("fs");
var logger = log4js.getLogger('deleteDatabase.js');

logger.level="debug";


function dropAllDatabases(){
    //read database list from json.
    var databaseListRaw = fs.readFileSync("./databaseList.json");
    var databaseList = JSON.parse(databaseListRaw);

    dropDatabase.dropDatabases(databaseList);

}

dropAllDatabases();
