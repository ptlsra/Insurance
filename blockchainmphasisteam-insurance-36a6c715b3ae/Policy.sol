pragma solidity ^0.4.0;
import "./Insurance.sol";


///@title   Policy contract for policy management of customer.
///@author  Mphasis.
///@dev     all functions are tested and are currently in use.
contract Policy{
    ///@dev     Customer structure to maintain customer details 
    struct Customer{
        address     customerAddress;
        string      customerName;
        string      userName;
        uint        sumInsured;
        string      tenure;
        string      scheme;
    }
    ///@dev     Structure for dependent per policy
    struct Dependents{
        uint        policyId;
        bytes32[]   dependents;
        uint[]      dependentId;
    }
    ///@dev     Structure to hold dependent details
    struct DependentDetails{
        bytes32     dependentName;
        uint        age;
        bytes32     gender;
        bytes32     relation;
    }
    ///@dev     Structure to hold PolicyDetails
    struct PolicyDetails{
        uint                            policyId;
        address                         policyProvider;
        address                         customerAddress;
        uint                            policyValidity;     //unix timestamp
        uint                            policyTimestamp;
        mapping(uint     => bytes32)    policyDocumentFirstSlice;
        mapping(uint     => bytes32)    policyDocumentSecondSlice;
    }
    ///@dev     Structure to hold policies per customerAddress
    struct CustomerPolicies{
        address     customerAddress;
        uint[]      customerPolicyList;
    }

    uint    public  policyId            =   100;
    uint    public  dependentIdCounter  =   200;
    
    // mappings
    mapping(address         =>          Customer)           customer;
    mapping(uint            =>          Dependents)         dependents;
    mapping(uint            =>          PolicyDetails)      policy;
    mapping(address         =>          CustomerPolicies)   customerPolicies;
    mapping(uint            =>          DependentDetails)   dependentDetails;
    
    //events
    event RegisterCustomer(address customerAddress, string userName, string description);
    event CreatePolicy(address customerAddress, string userName, string description, address policyProvider, uint policyId);
    event AddDependent(address customerAddress, string userName, string description, uint policyId);
    
    //functions
    
    ///@dev         register customer
    ///@param       customerAddress     customer wallet address
    ///@param       customerName        customer name
    ///@param       userName            userName of the customer
    ///@param       sumInsured          insured amount
    function registerCustomer(address customerAddress,string customerName, string userName, uint sumInsured, string tenure)public {
        customer[customerAddress] = Customer({customerAddress: customerAddress, customerName: customerName, userName: userName, sumInsured: sumInsured, tenure: tenure, scheme: ""});
        uint[] memory emptyPolicyList = new uint[](0);
        customerPolicies[customerAddress] = CustomerPolicies({customerAddress: customerAddress, customerPolicyList: emptyPolicyList});
        
        RegisterCustomer(customerAddress, userName, "user registration");
    }
    
    ///@dev         get registered customer details
    ///@param       customerAddress     customer wallet address
    function getCustomerDetails(address customerAddress)constant public  returns(address, string, string, uint, string, string){
        return (customer[customerAddress].customerAddress, customer[customerAddress].customerName, customer[customerAddress].userName, customer[customerAddress].sumInsured, customer[customerAddress].tenure, customer[customerAddress].scheme);
    }
    
    ///@dev         create customer policy
    ///@param       policyProvider      wallet address of the policy provider
    ///@param       policyValidity      unix timestamp
    function createPolicy(address policyProvider, address customerAddress, uint policyValidity)public {
        policyId                =   policyId    +   1;
        policy[policyId]        =   PolicyDetails({policyId:policyId, policyProvider: policyProvider, customerAddress: customerAddress, policyValidity: policyValidity, policyTimestamp: block.timestamp});
        
        bytes32[] memory emptyList = new bytes32[](0);
        uint[] memory emptyIdList = new uint[](0);
        
        dependents[policyId]    =   Dependents({policyId:policyId, dependents:emptyList, dependentId:emptyIdList});
        customerPolicies[customerAddress].customerPolicyList.push(policyId);
        CreatePolicy(customerAddress, customer[customerAddress].userName, "policy created", policyProvider, policyId);
        
    }
    ///@dev           upload policy document
    ///@param         policyId                   policyId of the customer
    ///@param         policyDocumentFirstSlice   first slice of document hash
    ///@param         policyDocumentSecondSlice  second slice of document hash
    function uploadPolicyDocument(uint policyId, bytes32 policyDocumentFirstSlice, bytes32 policyDocumentSecondSlice)public{
        policy[policyId].policyDocumentFirstSlice[policyId]     =   policyDocumentFirstSlice;
        policy[policyId].policyDocumentSecondSlice[policyId]    =   policyDocumentSecondSlice;
        
        //event for document upload
        
    }
    ///@dev           
    function addDependents(uint policyId, bytes32 dependent, uint age, bytes32 gender, bytes32 relation)public{
        dependents[policyId].dependents.push(dependent);
        dependents[policyId].dependentId.push(dependentIdCounter);
        dependentDetails[dependentIdCounter] = DependentDetails({dependentName : dependent, age : age, gender : gender, relation:relation});
        AddDependent(policy[policyId].customerAddress, customer[policy[policyId].customerAddress].userName, "dependent added", policyId);
        dependentIdCounter =   dependentIdCounter + 1;
    }
    
    function getPolicy(uint policyId, address insuranceCompany)constant public returns(address, address,  uint, bytes32, bytes32, uint){
        //check whether the insuranceCompany is in the list or not
        return(policy[policyId].policyProvider, policy[policyId].customerAddress, policy[policyId].policyValidity, policy[policyId].policyDocumentFirstSlice[policyId], policy[policyId].policyDocumentSecondSlice[policyId], policy[policyId].policyTimestamp);
    }
    
    function getPolicyDocument(uint policyId)constant public returns(bytes32, bytes32){
        return(policy[policyId].policyDocumentFirstSlice[policyId], policy[policyId].policyDocumentSecondSlice[policyId]);
    }
    
    function getCustomerPolicies(address customerAddress)constant public returns(address, uint[]){
        return (customerPolicies[customerAddress].customerAddress, customerPolicies[customerAddress].customerPolicyList);
    }

    function getDependents(uint policyId)constant public returns(bytes32[], uint[]){
        return (dependents[policyId].dependents, dependents[policyId].dependentId);
    }
    
    function getDependentDetails(uint dependentId)constant public returns(bytes32, uint, bytes32, bytes32){
        return (dependentDetails[dependentId].dependentName, dependentDetails[dependentId].age, dependentDetails[dependentId].gender, dependentDetails[dependentId].relation);
    }
    
    //update details of customer(Tenure and sumInsured)
    function updateTenureAndSumInsured(address customerAddress, uint sumInsured, string tenure, string scheme)public{
        customer[customerAddress].sumInsured = sumInsured;
        customer[customerAddress].tenure = tenure;
        customer[customerAddress].scheme = scheme;
    }
}
