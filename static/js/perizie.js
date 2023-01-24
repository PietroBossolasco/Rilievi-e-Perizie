"use strict";

window.onload = async function () {
  loadGoogleApi().then(reqPerizie);
  setSelect();
  customize();
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
        tr.on("click", () => {
          console.log("click");
          let div = $("<div>").addClass("info-perizia").appendTo($("body").eq(0));
          let mainDiv = $("<div>").addClass("bg-info-perizia").appendTo(div);
          let wrapper = $("<div>").addClass("wrapper-info-perizia").appendTo(mainDiv);
          $("<p>").addClass("info-perizia-title").appendTo(wrapper).text(item.name);
          $("<p>").addClass("info-perizia-description").appendTo(wrapper).text(item.description);
          let imgWrapper = $("<div>").addClass("img-wrapper").appendTo(wrapper);
          let imgDiv = $("<div>").addClass("img").appendTo(imgWrapper)
          $("<img>").addClass("info-perizia-image").appendTo(imgDiv).attr("src", item.image);
          $("<p>").text(item.imageComment).appendTo(imgDiv);
          $("<div>").addClass("map").appendTo(wrapper);
          let cord = item.coord.split(",");
          let sede = new google.maps.LatLng(cord[0], cord[1])
          let mapDiv = document.getElementsByClassName("map")[0];
          var posizione = new google.maps.LatLng(cord[0], cord[1]);
          var mapOptions = {
            center: posizione,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP, // default=ROADMAP
          };
          let mappa = new google.maps.Map(mapDiv, mapOptions)
          var icon1 = {
            url: "/img/marker.png",
            scaledSize: new google.maps.Size(30, 40), // dimensioni
            // anchor: new google.maps.Point(30, 40), // posizione
            // origin: new google.maps.Point(0,0), // file con icone multiple
          };
  
          let markerOptions = {
            map: mappa,
            position: posizione,
            title: "IIS Vallauri", // tooltip
            label: "", // lettera maiuscola singola
            icon: icon1, // complex icon
            zIndex: 3, // in caso di marcatori vicini/sovrapposti
            animation: google.maps.Animation.DROP, // .BOUNCE oscilla
            draggable: false, // rende il marcatore trascinabile
          };
          let marcatore1 = new google.maps.Marker(markerOptions);
  
          let btn = $("<button>").addClass("btn-info-perizia").appendTo(wrapper).text("Chiudi").on("click", () => {
            div.remove();
          });
        });
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
        tr.on("click", () => {
          console.log("click");
          let div = $("<div>").addClass("info-perizia").appendTo($("body").eq(0));
          let mainDiv = $("<div>").addClass("bg-info-perizia").appendTo(div);
          let wrapper = $("<div>").addClass("wrapper-info-perizia").appendTo(mainDiv);
          $("<p>").addClass("info-perizia-title").appendTo(wrapper).text(item.name);
          $("<p>").addClass("info-perizia-description").appendTo(wrapper).text(item.description);
          $("<img>").addClass("info-perizia-image").appendTo(wrapper).attr("src", item.image);
          $("<div>").addClass("map").appendTo(wrapper);
          let cord = item.coord.split(",");
          let sede = new google.maps.LatLng(cord[0], cord[1])
          let mapDiv = document.getElementsByClassName("map")[0];
          var posizione = new google.maps.LatLng(cord[0], cord[1]);
          var mapOptions = {
            center: posizione,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP, // default=ROADMAP
          };
          let mappa = new google.maps.Map(mapDiv, mapOptions)
          var icon1 = {
            url: "/img/marker.png",
            scaledSize: new google.maps.Size(30, 40), // dimensioni
            // anchor: new google.maps.Point(30, 40), // posizione
            // origin: new google.maps.Point(0,0), // file con icone multiple
          };
  
          let markerOptions = {
            map: mappa,
            position: posizione,
            title: "IIS Vallauri", // tooltip
            label: "", // lettera maiuscola singola
            icon: icon1, // complex icon
            zIndex: 3, // in caso di marcatori vicini/sovrapposti
            animation: google.maps.Animation.DROP, // .BOUNCE oscilla
            draggable: false, // rende il marcatore trascinabile
          };
          let marcatore1 = new google.maps.Marker(markerOptions);
  
          let btn = $("<button>").addClass("btn-info-perizia").appendTo(wrapper).text("Chiudi").on("click", () => {
            div.remove();
          });
        });
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


function loadGoogleApi() {
  return new Promise((resolve, reject) => {
      const MAP_KEY = takeMapKey();
      const URL = takeUrl();
      var script = document.createElement('script');
      document.body.appendChild(script);
      script.type = 'text/javascript';
      script.src = URL + '/js?v=3&key=' + MAP_KEY;
      script.onload = () => resolve()
      script.onerror = function () { reject(new Error("errore sul caricamento")) }
  })
}
