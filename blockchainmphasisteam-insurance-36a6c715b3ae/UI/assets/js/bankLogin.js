$(document).ready(function () {
	localStorage.setItem("ipAddress", "172.21.80.81");
	localStorage.setItem("port", "5000");
	var ipAddress = localStorage.getItem("ipAddress");
	var port = localStorage.getItem("port");
	$("#main_container").hide();
	$("#Incorrect").hide();

	$("#main_footer").hide();


	$("#show_login").click(function () {
		$("#main_container").show();
		$("#main_footer").show();
	});


	$("#goData").click(function () {
		var bankCode = $("#bankCode").val();


		/*   $.getJSON("http://"+ipAddress+":"+port+"/logInBank?ifsc="+bankCode, function(result){
              //alert(JSON.stringify(result));
              var loginData=JSON.stringify(result);
              var data_bank=loginData.includes("Bank");
              //var data_bank=loginData.includes("Bank");
             
              
              
              if(data_bank==true){
            	 
            		  
            		  alert("Incorrect IFSC code");
            	  
            	  
 				
 				setTimeout(function(){  window.location.href = "bankLogin.html"; }, 3000);
            	  

              
            }
              if(data_bank==false)
{
            	  //alert(result[0].bankName);
            	  
            	  localStorage.setItem("banksName", result[0].bankName);
            	  localStorage.setItem("bank_id", result[0].bankId);
            	  localStorage.setItem("bankCode", bankCode);
            	  localStorage.setItem("publicKey", result[0].publicKey);
            	  localStorage.setItem("location", result[0].location);
            	  
            	  //localStorage.setItem("ifsc", result[0].bankId);
            	  //alert("Corect");
            	  setTimeout(function(){  window.location.href = "home.html"; }, 3000);
            	  
            	  }              
             
            	
 				//setTimeout(function(){  window.location.href = "index.html"; }, 1000);
            	  

              
            

              });
              
           */
		if (bankCode == "bankadmin") {
			setTimeout(function () {
				window.location.href = "home.html";
			}, 1000);


		} else {

			$("#Incorrect").show();
		}

	});
});