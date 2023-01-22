"use strict";

window.onload = async function () {
  loadGoogleApi().then(setMap);
  customize();
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
      responsive:true
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

  let markerOptions2 = {
    map: mappa,
    position: new google.maps.LatLng(44.6558363, 7.733851),
    title: "IIS Vallauri", // tooltip
    label: "", // lettera maiuscola singola
    icon: icon1, // complex icon
    zIndex: 3, // in caso di marcatori vicini/sovrapposti
    animation: google.maps.Animation.DROP, // .BOUNCE oscilla
    draggable: false, // rende il marcatore trascinabile
  };

  new google.maps.Marker(markerOptions2);
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






function customize(){
  let req = inviaRichiesta("GET", "/api/info");
  req.fail(errore);
  req.done((data) => {
    data = JSON.parse(data);
    console.log(data);
  });
}