 var tempLists = [];
 var dataSets = [];



 var ipAddress = ipAddress();
 var portNo = portNo();



 $.get("/getAllCustomerPolicies", function (response) {
 	// 	   alert(JSON.stringify(response));
 	$.each(response, function (i, item) {
 		var walletAddress = item.policyHolderAddress;
 		var customerName = item.customerName;
 		var newcustomerName = customerName.split('_').join(' ');

 		var unixtimestamp = item.policyValidity;

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


 		var policyValidity = convdataTime;



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


 		//tempLists.push(i+1,item.policyId,convdataTime,policyValidity,'<button onclick=myFunction('+policyValidity+')>Click me</button>','<a  href=ViewAllPolicyForCustomer.html?walletAddress='+item.walletAddress+'> View Details');
 		tempLists.push(i + 1, item.policyId, newcustomerName, convdataTime, policyValidity, '<a  href=ViewPolicyDetailsAdmin.html?walletAddress=' + walletAddress + '&policyId=' + item.policyId + '> View Details');
 		dataSets.push(tempLists);
 		tempLists = [];




 	});


 	$('#viewAllPolicies').DataTable({
 		data: dataSets,
 		columns: [{
 				title: "SNo"
 			},
 			{
 				title: "Policy ID"
 			},
 			{
 				title: "Customer Name"
 			},
 			{
 				title: "Policy Issued "
 			},
 			{
 				title: "Policy Validity"
 			},
 			// {title: "Button"},
 			{
 				title: "Action"
 			}







 		]
 	});



 });