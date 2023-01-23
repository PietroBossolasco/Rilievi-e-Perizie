"use strict";

window.onload = function () {
  window.screen.orientation.lock('portrait');

  if(localStorage.getItem("logged") == 'true'){
    log(localStorage.getItem("password"), localStorage.getItem("username"));
  }
  else{
    $(".load").eq(0).addClass("hidden");
  }

  $(".button")
    .eq(0)
    .on("click", function () {
      let username = $("input").eq(0).val();
      let password = CryptoJS.SHA256($("input").eq(1).val()).toString(
        CryptoJS.enc.Hex
      );
  $(".load").eq(0).fadeIn(100);
  $(".load").eq(0).removeClass("hidden");

    log(password, username);
    });
};

function log(password, username){
  let parameters = { username: username, password: password, platform: "mobile" };
  let req = inviaRichiesta("POST", "/api/login", parameters);
  req.done(function (data) {
    console.log(data);
    // data = JSON.parse(data);
    console.log(data);
    var storage = window.localStorage;
    storage.setItem("username", username);
    storage.setItem("password", password);
    storage.setItem("logged", "true");
    $(".load").eq(0).fadeOut(100);
    window.location.href = "/index.html";
  });
  req.fail(() => {
    console.log(req.status);
    if (req.status == 401) {
      $(".err").eq(0).text("Username o password errati");
      $(".err").eq(0).fadeIn(100);
    } else if (req.status == 503) {
      $(".err").eq(0).text("Errore interno del server");
      $(".err").eq(0).fadeIn(100);
    }else if(req.status == 414){
      $(".err").eq(0).text("Utente non autorizzato");
      $(".err").eq(0).fadeIn(100);
    }

    $(".load").eq(0).fadeOut(100);
  });
}