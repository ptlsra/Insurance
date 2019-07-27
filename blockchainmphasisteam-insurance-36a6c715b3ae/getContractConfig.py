import urllib3
import json
import sys

def getConfigData(ipAddress):
    http = urllib3.PoolManager()
    url="http://"+str(ipAddress)+":5000/getContractConfig"
    r = http.request('GET', url);
    configData = r.data.decode("UTF-8");
    configData = json.loads(configData);
    data =configData["contractConfigData"];

    with open('contractConfig.json', 'w') as outfile:
        json.dump(data, outfile)
    print ("contractConfig updated");

cmdInput = sys.argv;
print(cmdInput[1]);
getConfigData(cmdInput[1]);