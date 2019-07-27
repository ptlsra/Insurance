var http = require('http');
var fs = require("fs");

function getContractConfig(ipAddress){
console.log("getContractConfig");

var options = {
    host: ipAddress,
    port: 5000,
    path: '/getContractConfig?',
    method: 'GET'
  };

  try{
  http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);

      //write this to contractConfig.json
        contractConfigData = JSON.parse(chunk).contractConfigData;
        console.log("contractConfigData : "+JSON.stringify(contractConfigData));
        fs.writeFileSync("./contractConfig.json",JSON.stringify(contractConfigData));
    });
  }).end();
}catch(e){
    console.log(e);
}
}


var cmdArgs = process.argv.slice(2);
console.log("args : " + cmdArgs);

getContractConfig(cmdArgs[0]);