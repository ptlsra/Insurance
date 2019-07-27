 $(document).ready(function () {
 	$("#id").hide();

 	function getUrlParameter(name) {
 		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
 		if (results == null) {
 			return null;
 		} else {
 			return decodeURI(results[1]) || 0;
 		}
 	}

 	var listindex = getUrlParameter('listindex');

 	var ipAddress = localStorage.getItem("ipAddress");
 	var port = localStorage.getItem("port");
 	//alert(ipAddress +port);
 	$.get("/getPortfolio?index=" + listindex, function (response) {

 		// alert(JSON.stringify(response));

 		document.getElementById("jumbotron_para").innerHTML = "Details For Portfolio Created with Loan ID :" + response["loanId"];
 		document.getElementById("loanId").value = response.loanId;
 		document.getElementById("id").value = listindex;
 		document.getElementById("firstName").value = response.firstName;
 		document.getElementById("lastName").value = response.lastName;
 		document.getElementById("email").value = response.emailId;
 		document.getElementById("phone").value = response.mobileNumber;
 		document.getElementById("gender").value = response.gender;
 		document.getElementById("address").value = response.locationAddress;
 		document.getElementById("salary").value = response.netSalaryIncome;
 		document.getElementById("etype").value = response.enrollmentType;


 		var loanId = response.loanId;


 		// $("#submitButton").click(function(){


 		/*   $.post("http://"+ipAddress+":"+port+"/approveLoanRequestByBank",
			        {
			          id: listIndex,
			          requestId: loanId,
			          responseType:"approve"
			        },
			        function(data,status){
			            alert("Data: " + data + "\nStatus: " + status);
			        });
			    });
		   //alert("here");
		   
		   
		   //Send the proper header information along with the request

		  
		   
		  
		  // xhttp.send("fname=Henry&lname=Ford");
		  
	   
*/



 		//  window.location="/bankModule/ApproveInitialLoanRequest?id="+listindex+"&requestId="+loanId+"&responseType=approve";

 		// });
 	});



 });