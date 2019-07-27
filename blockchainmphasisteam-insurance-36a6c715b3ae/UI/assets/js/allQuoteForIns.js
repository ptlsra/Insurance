var ipAddress = ipAddress();
var portNo = portNo();

var ipfsPortNo = ipfsPortNo();
var ipfsIpAddress = ipfsIpAddress();


var tempLists = [];
var dataSets = [];


$.ajax({

	dataType: "json",
	url: "/getClaimListForInsurance",
	global: false,
	type: 'GET',
	async: false, //blocks window close
	success: function (response) {
		//	 alert(JSON.stringify(response));
		$.each(response, function (i, item) {


			var unixtimestamp = item.timestamp;

			unixtimestamp = unixtimestamp.toString().slice(0, -9);

			// Months array
			var months_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

			// Convert timestamp to milliseconds
			var date = new Date(unixtimestamp * 1000);

			// Year
			var year = date.getFullYear();

			// Month
			var month = months_arr[date.getMonth()];

			// Day
			var day = date.getDate();

			// Hours
			var hours = date.getHours();

			// Minutes
			var minutes = "0" + date.getMinutes();

			// Seconds
			var seconds = "0" + date.getSeconds();

			// Display date time in MM-dd-yyyy h:m:s format
			var convdataTime = month + '-' + day + '-' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

			var customerName = item.policyHolderName;
			var newcustomerName = customerName.split('_').join(' ');

			var patientName = item.patientName;
			var newpatientName = patientName.split('_').join(' ');


			var amount = item.claimEstimate;
			var strRepass = amount;

			var strRepass = amount.toString().split('.');
			if (strRepass[0].length >= 4) {
				strRepass[0] = strRepass[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
			}
			if (strRepass[1] && strRepass[1].length >= 4) {
				strRepass[1] = strRepass[1].replace(/(\d{3})/g, '$1 ');
			}
			strRepass.join('.');


			if (item.claimStatus == "initialApprovalPending") {
				var displayStatus = "Pending Approval";

				tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, displayStatus, '<a  href=ViewClaimDetails.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> View ');
				dataSets.push(tempLists);
				tempLists = [];

			}

			if (item.claimStatus == 'needInsuranceApproval') {
				var displayStatus = "Approve Insurance"
				//tempLists.push(i+1,item.claimId,nameReplaced,item.policyId,"$"+strRepass,'<a title="'+ item.walletAddress+'"href=#?'+item.walletAddress+ '>'+item.walletAddress.substr(0, 20)+'....','<a  href=InitateClaimDetails.html?policyId='+item.policyId+'&patientAddress='+item.walletAddress+'&name='+name+'> Initiate Claim');
				tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, displayStatus, '<a  href=ViewClaimDetails.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> View ');
				dataSets.push(tempLists);
				tempLists = [];
			}

			if (item.claimStatus == "billsPending") {

				if (item.approverName == "tpa" || item.approverName == "TPA") {

					tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, '<a  href=ViewClaimDetailsDone.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> Initial Approval Done by TPA ', '');
					dataSets.push(tempLists);
					tempLists = [];

				} else if (item.approverName == "mbroker" || item.approverName == "mBroker") {

					tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, '<a  href=ViewClaimDetailsDone.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> Initial Approval Done by mBroker ', '');
					dataSets.push(tempLists);
					tempLists = [];

				} else {
					tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, '<a  href=ViewClaimDetailsDone.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> Initial Approval Done ', '');
					dataSets.push(tempLists);
					tempLists = [];
				}


			}




			if (item.claimStatus == "finalApprovalPending") {
				if (item.approverName == "mBroker" || item.approverName == "mbroker") {
					var displayStatus = "FinalApproval Pending From mBroker ";

					tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, displayStatus, '<a  href=FinalApprovalPendingMarsh.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> View ');
					dataSets.push(tempLists);
					tempLists = [];

				} else if (item.approverName == "TPA" || item.approverName == "tpa") {
					var displayStatus = "FinalApproval Pending From TPA ";

					tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, displayStatus, '<a  href=FinalApprovalPendingTPA.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> View ');
					dataSets.push(tempLists);
					tempLists = [];

				} else {
					var displayStatus = "FinalApproval Pending ";

					tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, displayStatus, '<a  href=FinalApprovalPending.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> View ');
					dataSets.push(tempLists);
					tempLists = [];
				}
			}





			if (item.claimStatus == "approved") {
				if (item.approverName == "mBroker" || item.approverName == "mbroker") {
					var displayStatus = "Claim Approved By mBroker";

					tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, displayStatus, '<a  href=FinalApprovalDone.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> View ');
					dataSets.push(tempLists);
					tempLists = [];

				} else if (item.approverName == "TPA" || item.approverName == "tpa") {
					var displayStatus = "Claim Approved By TPA";

					tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, displayStatus, '<a  href=FinalApprovalDone.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> View ');
					dataSets.push(tempLists);
					tempLists = [];

				} else {
					var displayStatus = "Claim Approved ";

					tempLists.push(i + 1, item.claimId, newcustomerName, newpatientName, convdataTime, strRepass, displayStatus, '<a  href=FinalApprovalDone.html?claimId=' + item.claimId + '&policyId=' + item.policyId + '&claimEstimate=' + amount + '&policyHolderName=' + customerName + '&patientName=' + patientName + '> View ');
					dataSets.push(tempLists);
					tempLists = [];
				}
			}





		});



	}
});





$('#pendingRequest3').DataTable({
	data: dataSets,
	//paging: false,
	//  searching: false,
	columns: [{
			title: "SNo"
		},
		{
			title: "Claim Id"
		},
		{
			title: "Policy Holder "
		},
		{
			title: "Claim Raised For"
		},
		{
			title: "Time Stamp"
		},
		{
			title: "Estimate(USD)"
		},
		{
			title: "Current Status "
		},
		{
			title: "Action "
		},




	]
});