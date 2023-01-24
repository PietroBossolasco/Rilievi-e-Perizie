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
          for(let a = 0; a < item.image.length; a++){
            let imgDiv = $("<div>").addClass("img").appendTo(imgWrapper)
            $("<img>").addClass("info-perizia-image").appendTo(imgDiv).attr("src", item.image[a]);
            $("<p>").text(item.imageComment[a]).appendTo(imgDiv);
          }
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
  
          disegnaPercorso(item, sede)

          $("<button>").addClass("btn-info-perizia").appendTo(wrapper).text("Chiudi").on("click", () => {
            div.remove();
          });

          $("<button>").css("right", "calc(10vw + 10%) !important").addClass("btn-info-perizia").appendTo(wrapper).text("Modifica").on("click", () => {
            $(".wrapper-info-perizia").empty();
            $("<p>").addClass("subtitle").appendTo($(".wrapper-info-perizia")).text("Nome perizia")
            $("<input>").attr({"type": "text", "placeholder" : "Nome perizia"}).appendTo($(".wrapper-info-perizia")).val(item.name);
            $("<p>").addClass("subtitle").appendTo($(".wrapper-info-perizia")).text("Descrizione perizia");
            $("<input>").attr({"type": "text", "placeholder" : "Descrizione perizia"}).appendTo($(".wrapper-info-perizia")).val(item.description);
            $("<p>").addClass("subtitle").appendTo($(".wrapper-info-perizia")).text("Descrizione immagini");
            let count = 0;
            for(let im of item.imageComment){
              count++;
              $("<input>").attr({"type": "text", "placeholder" : "Descrizione immagine " + count}).appendTo($(".wrapper-info-perizia")).val(im);
            }
            $("<button>").addClass("btn-info-perizia").appendTo(wrapper).text("Salva").on("click", function(){
              let data = {
                name : $(".wrapper-info-perizia").children("input").eq(0).val(),
                description : $(".wrapper-info-perizia").children("input").eq(1).val(),
                imageComment : [],
              }

              for(let i = 2; i < $(".wrapper-info-perizia").children("input").length; i++){
                if($(".wrapper-info-perizia").children("input").eq(i).val()){
                  data.imageComment.push($(".wrapper-info-perizia").children("input").eq(i).val());
                }
                else
                  data.imageComment.push("");

                let req = inviaRichiesta("POST", "/api/updatePerizia", {id : item._id, data : data});
                req.fail(errore);
                req.done((data) => {
                  console.log(data);
                  div.remove();
                  window.location.reload();
                });
              }
            })
            $("<button>").css("right", "calc(10vw + 10%) !important").addClass("btn-info-perizia").appendTo(wrapper).text("Annulla").on("click", () => {
              div.remove();
            });
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
          for(let a = 0; a < item.image.length; a++){
            let imgDiv = $("<div>").addClass("img").appendTo(imgWrapper)
            $("<img>").addClass("info-perizia-image").appendTo(imgDiv).attr("src", item.image[a]);
            $("<p>").text(item.imageComment[a]).appendTo(imgDiv);
          }
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

          $("<button>").css("right", "calc(10vw + 10%) !important").addClass("btn-info-perizia").appendTo(wrapper).text("Modifica").on("click", () => {
            $(".wrapper-info-perizia").empty();
            $("<p>").addClass("subtitle").appendTo($(".wrapper-info-perizia")).text("Nome perizia")
            $("<input>").attr({"type": "text", "placeholder" : "Nome perizia"}).appendTo($(".wrapper-info-perizia")).val(item.name);
            $("<p>").addClass("subtitle").appendTo($(".wrapper-info-perizia")).text("Descrizione perizia");
            $("<input>").attr({"type": "text", "placeholder" : "Descrizione perizia"}).appendTo($(".wrapper-info-perizia")).val(item.description);
            $("<p>").addClass("subtitle").appendTo($(".wrapper-info-perizia")).text("Descrizione immagini");
            let count = 0;
            for(let im of item.imageComment){
              count++;
              $("<input>").attr({"type": "text", "placeholder" : "Descrizione immagine " + count}).appendTo($(".wrapper-info-perizia")).val(im);
            }
            $("<button>").addClass("btn-info-perizia").appendTo(wrapper).text("Salva").on("click", function(){
              let data = {
                name : $(".wrapper-info-perizia").children("input").eq(0).val(),
                description : $(".wrapper-info-perizia").children("input").eq(1).val(),
                imageComment : [],
              }

              for(let i = 2; i < $(".wrapper-info-perizia").children("input").length; i++){
                if($(".wrapper-info-perizia").children("input").eq(i).val()){
                  data.imageComment.push($(".wrapper-info-perizia").children("input").eq(i).val());
                }
                else
                  data.imageComment.push("");

                let req = inviaRichiesta("POST", "/api/updatePerizia", {id : item._id, data : data});
                req.fail(errore);
                req.done((data) => {
                  console.log(data);
                  div.remove();
                  window.location.reload();
                });
              }
            })
            $("<button>").css("right", "calc(10vw + 10%) !important").addClass("btn-info-perizia").appendTo(wrapper).text("Annulla").on("click", () => {
              div.remove();
            });
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

function disegnaPercorso(perizia, latlng) {
  var directionsService = new google.maps.DirectionsService();
  let coords = perizia.coord.split(",");
  var routesOptions = {
    origin: new google.maps.LatLng(44.5558363, 7.733851),
    destination: new google.maps.LatLng(
      coords[0],
      coords[1]
    ),
    travelMode: google.maps.TravelMode.DRIVING, // default
    provideRouteAlternatives: true, // default=false
    avoidTolls: false, // default (con pedaggi)
  };
  directionsService.route(routesOptions, function (directionsRoutes) {
    var mapOptions = {
      mapTypeId: google.maps.MapTypeId.ROADMAP, // default=ROADMAP
    };
    var mappa = new google.maps.Map(document.getElementsByClassName("map")[0], mapOptions);
    if (directionsRoutes.status == google.maps.DirectionsStatus.OK) {
      console.log(directionsRoutes.routes[0]);

      let renderOptions = {
        polylineOptions: {
          strokeColor: "#44F", // colore del percorso
          strokeWeight: 6, // spessore
          zIndex: 100, // posizionamento
        },
      };
      let directionsRenderer = new google.maps.DirectionsRenderer(
        renderOptions
      );
      directionsRenderer.setMap(mappa); // Collego il renderer alla mappa
      directionsRenderer.setRouteIndex(0);
      directionsRenderer.setDirections(directionsRoutes);

      console.log(
        directionsRoutes.routes[0].legs[0].duration.text
      );
    }
  });
}
