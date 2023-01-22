"use strict";

window.onload = function(){
    setSelect();
    customize();
}

async function customize(){
    let req = inviaRichiesta("GET", "/api/info");
    req.fail(errore);
    req.done((data) => {
      data = JSON.parse(data);
      console.log(data);
      // Accede tramite jQuery ai figli di .user
      $(".user").children().eq(0).attr("src", data.profilePic);
      $(".user").children().eq(1).text(data.nome + " " + data.cognome);
      $(".load").eq(0).fadeOut(200);
    });
}

function setSelect(){
    let req = inviaRichiesta("GET", "/api/takeAllUsers");
    req.fail(errore);
    req.done(function (data) {
      data = JSON.parse(data);
      let select = $("#author");
      select.empty();
      $("<option>").text("Tutti").appendTo(select);
      for (let item of data) {
        let option = $("<option>").text(item.username).appendTo(select);
        option.attr("value", item.id);
      }
    });
  }