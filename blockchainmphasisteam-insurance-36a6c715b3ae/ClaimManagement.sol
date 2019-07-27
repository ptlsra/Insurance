pragma solidity^0.4.0;
import "./Insurance.sol";
contract ClaimManagement{
    
    struct InitialClaim{
        uint                        claimId;
        address                     patientAddress;
        uint                        policyId;
        address                     fromAddress;
        uint                        timestamp;                  //unix epoch
        uint                        claimEstimate;
        mapping(uint => bytes32)    claimEstimateDocFirstSlice;
        mapping(uint => bytes32)    claimEstimateDocSecondSlice;
        address                     initiallyApprovedBy;
    }
    
    struct ClaimDetails{
        uint        claimId;
        bytes32     claimStatus;
        address     insuranceAddress;
        address     brokerAddress;
        address     tpaAddress;
        bytes32[]   documetHashFirstSlice;
        bytes32[]   documentHashSecondSlice;
        uint        claimAmount;
    }
    
    struct HospitalClaims{
        address     patientAddress;
        uint[]      claimId;
    }
    
    uint public claimId = 5001;
    
    //mapping
    mapping(uint        =>      InitialClaim)   initialClaim;
    mapping(uint        =>      ClaimDetails)   claimDetails;
    mapping(address     =>      HospitalClaims) hospitalClaims;
    //mapping(address     =>      ClaimList)      claimList;
    uint[] public claimList;


    //events
    event InitialClaimEvent(uint policyId, address patientAddress, uint claimId, address fromAddress, string description);
    event InitialClaimApproval(uint policyId, address patientAddress, uint claimId, address fromAddress, string description);
    event UploadClaimDocument(uint policyId, address patientAddress, uint claimId, address fromAddress, string description);
    event FinalClaimApproval(uint policyId, address patientAddress, uint claimId, address fromAddress, string description);
    event UpdateClaimStatus(uint policyId, uint claimId,  bytes32 claimStatus);
    event UploadEstimateDocument(uint claimId, string description);
    event UploadEstimateDocument(uint claimId);
    
    function addHospitalClaims(address patientAddress, uint claimId)public{
        uint[] memory emptyClaimList = new uint[](0);
        if(hospitalClaims[patientAddress].patientAddress!=0){
            hospitalClaims[patientAddress].claimId.push(claimId);
        }else{
            hospitalClaims[patientAddress] = HospitalClaims({patientAddress: patientAddress, claimId: emptyClaimList});
            hospitalClaims[patientAddress].claimId.push(claimId);
        }
    }
    
    function initiateClaim(address patientAddress, uint policyId, address fromAddress, address contractAddress, uint claimEstimate)public {
        initialClaim[claimId]   =   InitialClaim({claimId: claimId, patientAddress: patientAddress, policyId: policyId, fromAddress: fromAddress, timestamp: block.timestamp, claimEstimate: claimEstimate, initiallyApprovedBy:0});
        bytes32[] memory emptyList = new bytes32[](0);
        
        this.addHospitalClaims(patientAddress, claimId);
        
        //set claim claimList 
        
        //Get the insurance address, brokerAddress and tpaAddress from Insurance Contract;
        address insuranceAddress; address tpaAddress; address brokerAddress;
        Insurance insuranceContract = Insurance(contractAddress);
        require(insuranceContract.getPolicyOwnersStatus(policyId) == true);
        
        (insuranceAddress, tpaAddress, brokerAddress) = insuranceContract.getPolicyOwners(policyId);
        
        //add claimId to broker, insurance, and tpa's claimList
        insuranceContract.setClaimForInsurance(insuranceAddress, claimId);
        insuranceContract.setClaimForBroker(brokerAddress, claimId);
        insuranceContract.setClaimForTpa(tpaAddress, claimId);
        
        //add it to claimList
        claimList.push(claimId);
        
        bytes32 claimStatus;
        if(claimEstimate <= 50000){
            claimStatus = "initialApprovalPending";
        }else{
            claimStatus = "needInsuranceApproval";
        }
        claimDetails[claimId]   =   ClaimDetails({claimId: claimId, claimStatus: claimStatus, insuranceAddress: insuranceAddress, brokerAddress: brokerAddress, tpaAddress: tpaAddress, documetHashFirstSlice: emptyList, documentHashSecondSlice: emptyList, claimAmount: 0});
        
        InitialClaimEvent(initialClaim[claimId].policyId, initialClaim[claimId].patientAddress, claimId, fromAddress, "claim initiated");
        //UpdateClaimStatus(initialClaim[claimId].policyId, claimId, claimStatus);
        claimId = claimId + 1;
    }
    
    
    
    function uploadEstimateDocument(uint claimId, bytes32 claimEstimateDocFirstSlice, bytes32 claimEstimateDocSecondSlice){
        initialClaim[claimId].claimEstimateDocFirstSlice[claimId]   = claimEstimateDocFirstSlice;
        initialClaim[claimId].claimEstimateDocSecondSlice[claimId]  = claimEstimateDocSecondSlice;
        
        //event
        UploadEstimateDocument(claimId);
    }
    
    function initialClaimApproval(uint claimId, uint policyId, address approverAddress, address insuranceContractAddress)public{
         Insurance insuranceContract = Insurance(insuranceContractAddress);
         address insuranceAddress; address tpaAddress; address brokerAddress;
         
        (insuranceAddress, tpaAddress, brokerAddress) = insuranceContract.getPolicyOwners(policyId);
        if(initialClaim[claimId].claimEstimate <= 50000){
            require((approverAddress == insuranceAddress)||(approverAddress == tpaAddress)||(approverAddress==brokerAddress));
        }else{
            require(approverAddress == insuranceAddress);
        }
        
        //all is good approve
        initialClaim[claimId].initiallyApprovedBy= approverAddress;
        claimDetails[claimId].claimStatus = "billsPending";
        
        InitialClaimApproval(initialClaim[claimId].policyId, initialClaim[claimId].patientAddress, claimId,  approverAddress, "claim accepted");
        UpdateClaimStatus(initialClaim[claimId].policyId, claimId, claimDetails[claimId].claimStatus);
    }

    function updateClaimAmount(uint claimId, uint claimAmount, address fromAddress)public{
        require(fromAddress == initialClaim[claimId].fromAddress);

        //everthing looks good. Update the claimAmount 
        claimDetails[claimId].claimAmount = claimAmount;
    }
    
    function uploadClaimDocuments(uint claimId, address fromAddress, bytes32 documetHashFirstSlice, bytes32 documentHashSecondSlice, uint claimAmount)public {
        require(fromAddress == initialClaim[claimId].fromAddress);
        
        //add document hash 
        claimDetails[claimId].documetHashFirstSlice.push(documetHashFirstSlice);
        claimDetails[claimId].documentHashSecondSlice.push(documentHashSecondSlice);
        claimDetails[claimId].claimAmount = claimAmount;
        claimDetails[claimId].claimStatus = "finalApprovalPending";
        
        UploadClaimDocument(initialClaim[claimId].policyId, initialClaim[claimId].patientAddress, claimId, fromAddress, "bills uploaded");
        UpdateClaimStatus(initialClaim[claimId].policyId, claimId, claimDetails[claimId].claimStatus);
    }


    function finalClaimApproval(uint claimId, address approverAddress)public{
        require(initialClaim[claimId].initiallyApprovedBy == approverAddress);
        //all is good
        claimDetails[claimId].claimStatus = "approved";
        FinalClaimApproval(initialClaim[claimId].policyId, initialClaim[claimId].patientAddress, claimId, approverAddress, "claim approved");
        UpdateClaimStatus(initialClaim[claimId].policyId, claimId, claimDetails[claimId].claimStatus);
    }
    
    function getInitialClaimDetails(uint claimId)constant public returns(address, uint,  uint, uint, bytes32, bytes32, address){
        return(initialClaim[claimId].patientAddress, initialClaim[claimId].policyId, initialClaim[claimId].timestamp, initialClaim[claimId].claimEstimate, initialClaim[claimId].claimEstimateDocFirstSlice[claimId], initialClaim[claimId].claimEstimateDocSecondSlice[claimId], initialClaim[claimId].initiallyApprovedBy);
    }
    
    function getClaimDetails(uint claimId)constant public returns(bytes32, bytes32[], bytes32[], uint){
        return(claimDetails[claimId].claimStatus, claimDetails[claimId].documetHashFirstSlice, claimDetails[claimId].documentHashSecondSlice, claimDetails[claimId].claimAmount);
    }
    
    function getClaimOwners(uint claimId)constant public returns(address, address, address){
        return(claimDetails[claimId].brokerAddress, claimDetails[claimId].insuranceAddress, claimDetails[claimId].tpaAddress);
    }
    
    function getPatientClaims(address patientAddress)constant public returns(uint[]){
        return hospitalClaims[patientAddress].claimId;
    }
    
    //function to get claimList
    function getClaimList()constant public returns(uint[]){
        return claimList;
    }
    
}