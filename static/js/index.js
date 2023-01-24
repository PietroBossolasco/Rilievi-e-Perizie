"use strict";

window.onload = async function () {
  loadGoogleApi().then(setMap);
  customize();
  setLastPeri();
  var canvas = document.getElementById("canvas");
  var data = {
    type: "doughnut",
    data: {
      labels: ["pippo", "pluto", "minnie"], // keys
      datasets: [
        {
          label: "Titolo del grafico", // solo per diagramma a barre
          data: [14, 19, 32], // values
          backgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            // Nel caso si voglia utilizzare sempre lo stesso colore,
            // al posto del vettore si può assegnare una semplice stringa
          ],
          borderWidth: 1 /* default 2 */,
        },
      ],
    },
    options: {
      scales: {
        y: {
          suggestedMax: 40,
          suggestedMin: -40, // oppure
          beginAtZero: true,
        },
      },
      responsive: true
      //  maintainAspectRatio:false, */
    }
  }
  let chart = new Chart(canvas, data);

};

function setMap() {
  var div = document.getElementsByClassName("cardArea")[0];
  var posizione = new google.maps.LatLng(44.5558363, 7.733851);
  var mapOptions = {
    center: posizione,
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP, // default=ROADMAP
  };
  var mappa = new google.maps.Map(div, mapOptions);

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

  let req = inviaRichiesta("GET", "/api/requestPerizieByIdLimit")
  req.fail(errore);
  req.done((data) => {
    console.log(data);
    for (let item of data) {
      let a = item.coord.split(",")[0];
      let b = item.coord.split(",")[1];
      let markerOptions2 = {
        map: mappa,
        position: new google.maps.LatLng(a, b),
        title: item.name, // tooltip
        label: "", // lettera maiuscola singola
        icon: icon1, // complex icon
        zIndex: 3, // in caso di marcatori vicini/sovrapposti
        animation: google.maps.Animation.DROP, // .BOUNCE oscilla
        draggable: false, // rende il marcatore trascinabile
      };

      new google.maps.Marker(markerOptions2);
    }
  });
}

function loadGoogleApi() {
  return new Promise((resolve, reject) => {
    const MAP_KEY = takeMapKey();
    const URL = takeUrl();
    var script = document.createElement("script");
    document.body.appendChild(script);
    script.type = "text/javascript";
    script.src = URL + "/js?v=3&key=" + MAP_KEY;
    script.onload = () => resolve();
    script.onerror = function () {
      reject(new Error("errore sul caricamento"));
    };
  });
}

function customize() {
  let req = inviaRichiesta("GET", "/api/dbInfo", { username: localStorage.getItem("username") });
  req.fail(errore);
  req.done((data) => {
    console.log(data);
    // Accede tramite jQuery ai figli di .user
    $(".user").children().eq(0).attr("src", data.profilePic);
    $(".user").children().eq(1).text(data.nome + " " + data.cognome);
    $(".wc").eq(0).text("Benvenuto " + data.nome);
    $(".load").eq(0).fadeOut(200);
  });
}

function setLastPeri() {
  let req = inviaRichiesta("GET", "/api/ultimePerizie");
  console.log(req);
  req.fail(errore);
  req.done((data) => {
    console.log(data);
    $(".lower").empty();
    for (let item of data) {
      let div = $("<div>").addClass("minicard").appendTo(".lower");
      $("<div>").css("background-image", "url('" + item.image + "')").appendTo(div);
      $("<p>").text(item.name).addClass("titleCard").appendTo(div);
      $("<p>").text(item.description).addClass("paragraphCard").appendTo(div);
      div.on("click", () => {
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