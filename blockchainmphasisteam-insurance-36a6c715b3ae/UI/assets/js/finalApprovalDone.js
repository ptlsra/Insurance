 $("#MclaimId").hide();
 $("#MpolicyId").hide();

 /*
  *	Set IP Address and Port No. 
  */

 var ipAddress = ipAddress();
 var portNo = portNo();
 var ipfsIpAddress = ipfsIpAddress();
 var ipfsPortNo = ipfsPortNo();


 var getUrlParameter = function getUrlParameter(sParam) {
 	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
 		sURLVariables = sPageURL.split('&'),
 		sParameterName,
 		i;

 	for (i = 0; i < sURLVariables.length; i++) {
 		sParameterName = sURLVariables[i].split('=');

 		if (sParameterName[0] === sParam) {
 			return sParameterName[1] === undefined ? true : sParameterName[1];
 		}
 	}
 };

 var walletAddress = getUrlParameter('walletAddress');
 var claimId = getUrlParameter('claimId');
 var policyId = getUrlParameter('policyId');
 var claimEstimate = getUrlParameter('claimEstimate');
 document.getElementById("claimId").innerHTML = claimId;

 $("#MclaimId").val(claimId);
 $("#MpolicyId").val(policyId);

 var customerName = getUrlParameter('policyHolderName');
 var newcustomerName = customerName.split('_').join(' ');
 var patientName = getUrlParameter('patientName');
 var newpatientName = patientName.split('_').join(' ');

 document.getElementById("patientName").innerHTML = newpatientName;
 document.getElementById("policyHolderName").innerHTML = newcustomerName;

 var amount = claimEstimate;
 var strRepass = amount.toString().split('.');

 if (strRepass[0].length >= 4) {
 	strRepass[0] = strRepass[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
 }

 if (strRepass[1] && strRepass[1].length >= 4) {
 	strRepass[1] = strRepass[1].replace(/(\d{3})/g, '$1 ');
 }
 strRepass.join('.');


 /*
  * 	Get Claim Details.
  * 
  */

 $.get("/getClaimDetails?claimId=" + claimId, function (claimResponse) {

 	var amount = claimResponse.claimAmount;
 	var strRepass = amount.toString().split('.');

 	if (strRepass[0].length >= 4) {
 		strRepass[0] = strRepass[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
 	}

 	if (strRepass[1] && strRepass[1].length >= 4) {
 		strRepass[1] = strRepass[1].replace(/(\d{3})/g, '$1 ');
 	}

 	strRepass.join('.');

 	document.getElementById("claimAmount").innerHTML = "$" + strRepass;

 	$('#btnShow2').click(function () {

 		$("#dialog").dialog({

 			maxWidth: 600,
 			maxHeight: 450,
 			width: 600,
 			height: 450,
 			modal: true

 		});
 		//$("#frame").attr("src", "http://"+ipfsIpAddress+":"+ipfsPortNo+"/ipfs/"+claimResponse.bill);
 		// }); 
 		$.get("/ipfs?fileHash=" + claimResponse.bill, function (custResponse) {
 			$("#frame").attr("src", custResponse.ipfsUrl);
 		});
 	});

 });

 document.getElementById("policyPageTitle").innerHTML = "View Claim Details For Claim ID:" + claimId;

 document.getElementById("claimEstimate").innerHTML = "$" + strRepass;


 /*
  * 		Get Policy Details.
  * 
  */
 $.get("/getPolicyDetails?policyId=" + policyId, function (policyResponse) {
 	var unixtimestamp = policyResponse.policyValidity;
 	var months_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
 	var date = new Date(unixtimestamp * 1000);
 	var year = date.getFullYear();
 	var month = months_arr[date.getMonth()];
 	var day = date.getDate();
 	var hours = date.getHours();
 	var minutes = "0" + date.getMinutes();
 	var seconds = "0" + date.getSeconds();
 	var convdataTime = month + '-' + day + '-' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
 	var policyValidity = convdataTime;

 	unixtimestamp = policyResponse.timeStamp;
 	unixtimestamp = unixtimestamp.toString().slice(0, -9);
 	months_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
 	date = new Date(unixtimestamp * 1000);
 	year = date.getFullYear();
 	month = months_arr[date.getMonth()];
 	day = date.getDate();
 	hours = date.getHours();
 	minutes = "0" + date.getMinutes();
 	seconds = "0" + date.getSeconds();
 	convdataTime2 = month + '-' + day + '-' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

 	var policyIssued = convdataTime2;
 	//alert(JSON.stringify(policyResponse));
 	document.getElementById("customerPolicyId").innerHTML = policyId;
 	document.getElementById("policyProvider").innerHTML = policyResponse.policyProviders.brokerName;
 	document.getElementById("tpaProvider").innerHTML = policyResponse.policyProviders.tpaName;
 	document.getElementById("insProvider").innerHTML = policyResponse.policyProviders.insuranceName;
 	document.getElementById("insProvider").innerHTML = policyResponse.policyProviders.insuranceName;
 	document.getElementById("policyIssued").innerHTML = convdataTime2;
 	document.getElementById("policyValidity").innerHTML = convdataTime;

 	/*
 	 * 		Set Dependent Table.
 	 */


 	var table = document.getElementById("depTable");
 	var row = table.insertRow(0);
 	var cell1 = row.insertCell(0);
 	var cell2 = row.insertCell(1);
 	var cell3 = row.insertCell(2);
 	var cell4 = row.insertCell(3);
 	var cell5 = row.insertCell(4);

 	cell1.innerHTML = "Dependent ID";
 	cell2.innerHTML = "Name";
 	cell3.innerHTML = "Age";
 	cell4.innerHTML = "Gender";
 	cell5.innerHTML = "Relation";

 	$.get("/getDependents?policyId=" + policyId, function (response2) {
 		//	alert(JSON.stringify(response2));
 		var numberOfDep = response2.dependents.length;
 		for (var i = 0; i < numberOfDep; i++) {
 			row = table.insertRow(i + 1);
 			cell1 = row.insertCell(0);
 			var cell2 = row.insertCell(1);
 			var cell3 = row.insertCell(2);
 			var cell4 = row.insertCell(3);
 			var cell5 = row.insertCell(4);

 			var depName = response2.dependents[i].dependentName;
 			depName = depName.split('_').join(' ');
 			cell1.innerHTML = response2.dependents[i].dependentId;
 			cell2.innerHTML = depName;
 			cell3.innerHTML = response2.dependents[i].age;
 			cell4.innerHTML = response2.dependents[i].gender;
 			cell5.innerHTML = response2.dependents[i].relation;
 		}

 	});


 	$('#btnShow').click(function () {

 		$("#dialog").dialog({

 			maxWidth: 600,
 			maxHeight: 450,
 			width: 600,
 			height: 450,
 			modal: true

 		});
 		//$("#frame").attr("src", "http://"+ipfsIpAddress+":"+ipfsPortNo+"/ipfs/"+policyResponse.policyDocumentHash);
 		// }); 
 		$.get("/ipfs?fileHash=" + policyResponse.policyDocumentHash, function (custResponse) {
 			$("#frame").attr("src", custResponse.ipfsUrl);
 		});
 	});

 });