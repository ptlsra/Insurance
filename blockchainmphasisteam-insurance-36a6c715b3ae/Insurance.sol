pragma solidity^0.4.0;

contract Insurance{
    
    struct InsuranceCompany{
        bytes32     companyName;
        address     insuranceAddress;
    }
    
    struct Broker{
        bytes32     brokerName;
        address     brokerAddress;
    }
    
    struct TPA{
        bytes32     tpaName;
        address     tpaAddress;
    }
    
    address[] public insuranceCompanies;
    address[] public TPAs;
    address[] public brokers;
    
    struct PolicyOwners{
        uint        policyId;
        address     insuranceAddress;
        address     tpaAddress;
        address     brokerAddress;
        bool        status;
    }
    
    //for claims
    
    struct InsuranceClaims{
        address     insuranceAddress;
        uint[]      claimId;
    }
    
    struct BrokerClaims{
        address     brokerAddress;
        uint[]      claimId;
    }
    
    struct TpaClaims{
        address     tpaAddress;
        uint[]      claimId;
    }
    
    //for PolicyOwners
    
    struct InsurancePolicies{
        address     insuranceAddress;
        uint[]      policies;
    }

    struct BrokerPolicies{
        address     brokerAddress;
        uint[]      policies;
    }
    
    struct TpaPolicies{
        address     tpaAddress;
        uint[]      policies;
    }


    uint[]  emptyList = new uint[](0);
    
    //mapping
    mapping(address     =>      InsuranceCompany)   insuranceCompany;
    mapping(address     =>      Broker)             broker;
    mapping(address     =>      TPA)                tpa;
    mapping(uint        =>      PolicyOwners)       policyOwners;
    mapping(address     =>      InsuranceClaims)    insuranceClaims;
    mapping(address     =>      BrokerClaims)       brokerClaims;
    mapping(address     =>      TpaClaims)          tpaClaims;
    mapping(address     =>      InsurancePolicies)  insurancePolicies;
    mapping(address     =>      BrokerPolicies)     brokerPolicies;
    mapping(address     =>      TpaPolicies)        tpaPolicies;
    mapping(address     =>      bytes32)            companyNameList;      
    
    //events
    event RegisterInsuranceCompany(address insuranceAddress, bytes32 companyName, string description);
    event RegisterBroker(address brokerAddress, bytes32 brokerName, string description);
    event RegisterTPA(address tpaAddress, bytes32 tpaName, string description);
    event SetPolicyOwners(address insuranceAddress, address brokerAddress, address tpaAddress, uint policyId, string description);
    
    function registerInsuranceCompany(address insuranceAddress, bytes32 companyName)public{
        insuranceCompany[insuranceAddress] = InsuranceCompany({companyName: companyName, insuranceAddress: insuranceAddress});
        insuranceCompanies.push(insuranceAddress);
        
        insuranceClaims[insuranceAddress]   =  InsuranceClaims({insuranceAddress: insuranceAddress, claimId: emptyList});
        insurancePolicies[insuranceAddress]  =  InsurancePolicies({insuranceAddress: insuranceAddress, policies: emptyList});
        companyNameList[insuranceAddress] = companyName;
        RegisterInsuranceCompany(insuranceAddress, companyName, "insurance company registered");
    }
    
    function registerBroker(address brokerAddress, bytes32 brokerName)public{
        broker[brokerAddress] = Broker({brokerName: brokerName, brokerAddress: brokerAddress});
        brokers.push(brokerAddress);
        
        
        brokerClaims[brokerAddress] = BrokerClaims({brokerAddress: brokerAddress, claimId: emptyList});
        brokerPolicies[brokerAddress] = BrokerPolicies({brokerAddress: brokerAddress, policies: emptyList});
        companyNameList[brokerAddress] = brokerName;
        RegisterBroker(brokerAddress, brokerName, "broker registered");
        
    }
    
    function registerTPA(address tpaAddress, bytes32 tpaName)public{
        tpa[tpaAddress] = TPA({tpaName: tpaName, tpaAddress: tpaAddress});
        TPAs.push(tpaAddress);
        
        tpaClaims[tpaAddress]   = TpaClaims({tpaAddress: tpaAddress, claimId: emptyList});
        tpaPolicies[tpaAddress] = TpaPolicies({tpaAddress: tpaAddress, policies: emptyList});
        companyNameList[tpaAddress] = tpaName;
        RegisterTPA(tpaAddress, tpaName, "tpa registered");
    }
    
    function setPolicyOwners(uint policyId, address brokerAddress, address insuranceAddress, address tpaAddress)public{
        policyOwners[policyId] = PolicyOwners({policyId: policyId, insuranceAddress: insuranceAddress, tpaAddress: tpaAddress, brokerAddress: brokerAddress, status:true});
        
        insurancePolicies[insuranceAddress].policies.push(policyId);
        brokerPolicies[brokerAddress].policies.push(policyId);
        tpaPolicies[tpaAddress].policies.push(policyId);
        
        SetPolicyOwners(insuranceAddress, brokerAddress, tpaAddress, policyId, "Assigned as policy owner");
    }
    
    
    function getCompanyName(address companyAddress)constant public returns(bytes32){
        return companyNameList[companyAddress];
    }
    
    function getPolicyOwnersStatus(uint policyId)constant public returns(bool){
        return policyOwners[policyId].status;
    }
    
    function getPolicyOwners(uint policyId)constant public returns( address, address, address){
        return ( policyOwners[policyId].insuranceAddress, policyOwners[policyId].tpaAddress, policyOwners[policyId].brokerAddress);
    }
    
    function getBroker(address brokerAddress)constant public returns(address, bytes32){
        return (broker[brokerAddress].brokerAddress, broker[brokerAddress].brokerName);
    }
    
    function getInsuranceCompany(address insuranceAddress)constant public returns(address, bytes32){
        return (insuranceCompany[insuranceAddress].insuranceAddress, insuranceCompany[insuranceAddress].companyName);
    }
    
    function getTPA(address tpaAddress)constant public returns(address, bytes32){
        return (tpa[tpaAddress].tpaAddress, tpa[tpaAddress].tpaName);
    }
    
    
    function getListOfTPAs()constant returns(address[]){
        return(TPAs);
    }
    
    function getListOfBrokers()constant returns(address[]){
        return(brokers);
    }
    
    function getListOfInsuranceCompanies()constant returns(address[]){
        return(insuranceCompanies);
    }
    
    //claimList getter methods
    function getClaimsForInsurance(address insuranceAddress)constant public returns(uint[]){
        return insuranceClaims[insuranceAddress].claimId;
    }
    
    function getBrokerClaims(address brokerAddress)constant public returns(uint[]){
        return brokerClaims[brokerAddress].claimId;
    }
    
    function getTpaClaims(address tpaAddress)constant public returns(uint[]){
        return tpaClaims[tpaAddress].claimId;
    }
    
    //policy getter methods
    function getInsurancePolicies(address insuranceAddress)constant public returns(uint[]){
        return insurancePolicies[insuranceAddress].policies;
    }
    
    function getBrokerPolicies(address brokerAddress)constant public returns(uint[]){
        return brokerPolicies[brokerAddress].policies;
    }
    
    function getTpaPolicies(address tpaAddress)constant public returns(uint[]){
        return tpaPolicies[tpaAddress].policies;
    }
    
    //setClaims
    function setClaimForInsurance(address insuranceAddress, uint claimId)public {
        insuranceClaims[insuranceAddress].claimId.push(claimId);
    }
    
    function setClaimForBroker(address brokerAddress, uint claimId)public{
        brokerClaims[brokerAddress].claimId.push(claimId);
    }
    
    function setClaimForTpa(address tpaAddress, uint claimId)public{
        tpaClaims[tpaAddress].claimId.push(claimId);
    }
}
