pragma solidity^0.4.0;

contract Hospital{
    
    struct Patient{
        address     patientAddress;
        uint        patientId;
        string      patientName;
        uint        policyId;
    }
    
    struct PolicyDependents{
        uint        policyId;
        address[]   patients;
        
    }
    
    uint public patientId=101;
    
    //mapping
    mapping(address       =>      Patient)              patient;
    mapping(uint          =>      PolicyDependents)     policyDependents;
    
    // events
    event RegisterPatient(address patientAddress, string patientName, string description, uint policyId);
    
    function registerPatient(address patientAddress, string patientName, uint policyId){
        
        patient[patientAddress]  =   Patient({patientAddress: patientAddress, patientId: patientId, patientName: patientName, policyId: policyId});
        if(policyDependents[policyId].policyId != 0){
            policyDependents[policyId].patients.push(patientAddress);
        }else{
            
            address[] memory emptyList = new address[](0);
            
            policyDependents[policyId] = PolicyDependents({policyId: policyId, patients: emptyList});
            
            policyDependents[policyId].patients.push(patientAddress);
            
        }
        
        RegisterPatient(patientAddress, patientName, "patient registered", policyId);
        patientId = patientId + 1;
    }
    
    function getPatientDetails(address patientAddress)constant public returns(address, uint, string, uint){
        
        return(patient[patientAddress].patientAddress, patient[patientAddress].patientId, patient[patientAddress].patientName, patient[patientAddress].policyId);
    }
    
    
    function getPatientsByPolicy(uint policyId)constant public returns(address[]){
        return policyDependents[policyId].patients;
    }
    
}
