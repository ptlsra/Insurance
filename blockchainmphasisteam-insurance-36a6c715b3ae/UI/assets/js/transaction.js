$(document).ready(function () {
	var ipAddress = localStorage.getItem("ipAddress");
	var port = localStorage.getItem("port");

	var bank = localStorage.getItem("banksName");
	var bankId = localStorage.getItem("bank_id");
	var ifsc = localStorage.getItem("bankCode");
	var bankKey = localStorage.getItem("publicKey");
	var location = localStorage.getItem("location");
	var tempLists = [];
	var dataSets = [];


	document.getElementById("bankName").innerHTML = bank;
	document.getElementById("jumbotron_para").innerHTML = "All Transactions  for bank registered with Public Key: " + bankKey;
	//$("#main_footer").hide();
	document.getElementById("jumbotron_header").innerHTML = "Welcome To " + bank;

	// $.getJSON("http://localhost:5002/listOfLoanRequest?IFSC="+ifsc, function(data_result){
	//	alert(data_result.length);

	$.get("/allTransactionsForAPublicKey?publicKey=" + bankKey, function (response) {
		$.each(response, function (i, item) {
			tempLists.push('<a data-tooltip=' + item.txid + ' href=single_block.html?' + item.txid + '>' + item.txid.substr(0, 20) + '.....', item.timestamp);
			//tempLists.push(item.hashId,item.blockNumber);

			dataSets.push(tempLists);
			tempLists = [];

			//alert(dataSet);		               

		});
		//$('#res').dataTable();

		//alert(dataSet);
		$('#loanTable').DataTable({
			data: dataSets,
			columns: [{
					title: "Tx Id"
				},
				{
					title: "TimseStamp"
				}

			]
		});
	});


});