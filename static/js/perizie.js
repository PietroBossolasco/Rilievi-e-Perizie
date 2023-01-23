"use strict";

window.onload = function () {
  setSelect();
  customize();
  reqPerizie();
  $("#author").on("change", function () {
    if($(this).val() == "Tutti"){
      reqPerizie();
    }
    else{
      reqPerizie($(this).val());
    }
  });
}

function reqPerizie(nickname){
  if(!nickname){
    let req = inviaRichiesta("GET", "/api/requestPerizieByIdLimit");
    req.fail(errore);
    req.done((data) => {
      let table = $("tbody").eq(0);
      table.empty();
      for(let item of data){
        let tr = $("<tr>").appendTo(table);
        let username;
        for(let i of $("#author").children()){
          if(i.value == item.userId){
            username = i.text;
          }
        }
        $("<td>").text(username).appendTo(tr);
        $("<td>").text(item.coord).appendTo(tr);
        $("<td>").text(item.date + " " + item.hour).appendTo(tr);
        $("<td>").text(item.name).appendTo(tr);
      }
    });
  }
  else{
    console.log(nickname);
    let req = inviaRichiesta("GET", "/api/requestPerizieByIdLimit", {userId : nickname});
    req.fail(errore);
    req.done((data) => {
      let table = $("tbody").eq(0);
      table.empty();
      for(let item of data){
        let tr = $("<tr>").appendTo(table);
        let username;
        for(let i of $("#author").children()){
          if(i.val() == item.userId){
            username = i.text;
          }
        }
        $("<td>").text(username).appendTo(tr);
        $("<td>").text(item.coord).appendTo(tr);
        $("<td>").text(item.date + " " + item.hour).appendTo(tr);
        $("<td>").text(item.name).appendTo(tr);
      }
    });
  }
}

async function customize() {
  let req = inviaRichiesta("GET", "/api/dbInfo", { username: localStorage.getItem("username") });
  req.fail(errore);
  req.done((data) => {
    console.log(data);
    // Accede tramite jQuery ai figli di .user
    $(".user").children().eq(0).attr("src", data.profilePic);
    $(".user").children().eq(1).text(data.nome + " " + data.cognome);
    $(".load").eq(0).fadeOut(200);
  });
}

function setSelect() {
  let req = inviaRichiesta("GET", "/api/takeAllUsers");
  req.fail(errore);
  req.done(function (data) {
    let select = $("#author");
    select.empty();
    $("<option>").text("Tutti").appendTo(select);
    for (let item of data) {
      let option = $("<option>").text(item.username).appendTo(select);
      option.attr("value", item._id);
      console.log(item._id)
      option.prop("userid", item._id)
    }
  });
}