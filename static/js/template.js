"use strict";

function setlogout(){
    if(localStorage.getItem("token") == null)
        window.location.href = "login.html";
    console.log("window.onload");
    let div = $("<div>").appendTo($(".leftbar").eq(0)).addClass("logout").on("click", function() {
        localStorage.removeItem("username");
        window.location.href = "login.html";
    })
    $("<img>").attr("src", "/img/log-out.svg").appendTo(div);
    $("<p>").appendTo(div).text("Logout");
}