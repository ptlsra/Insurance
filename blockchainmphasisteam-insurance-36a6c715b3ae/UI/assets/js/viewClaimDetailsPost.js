var ipAdd = ipAddress();
var port = portNo();


//alert(ipAdd);



$("#approveClaimInitialButton").click(function () {

    var claimId = $("#MclaimId").val();
    var policyId = $("#MpolicyId").val();
    $("#txModal").modal();


    setTimeout(function () {

        $.ajax({

            dataType: "json",
            contentType: 'application/json; charset=UTF-8',
            url: "/acceptClaim?claimId=" + claimId + "&policyId=" + policyId,
            type: "POST",
            global: false,
            async: false,
            success: function (result) {
                //alert(result);

                document.getElementById("txId").innerHTML = result.txId;
                $("#txModal").hide();
                $("#myModal").modal();

                setTimeout(function () {

                    window.location.href = "AdminLanding.html";
                }, 2000);
                // ViewTokenForBaggage.html?baggageId=5615192
            }
        });
    }, 1000);



});