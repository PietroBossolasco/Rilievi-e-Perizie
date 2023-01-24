"use strict";

window.onload = async function () {
    loadGoogleApi().then(setMap)
    customize();
}

let sede;
var mappa;

function setMap() {
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

    sede = new google.maps.LatLng(44.5558363, 7.733851)
    var div = document.getElementsByClassName("wrapper")[0];
    var posizione = new google.maps.LatLng(44.5558363, 7.733851);
    var mapOptions = {
        center: posizione,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP, // default=ROADMAP
    };
    mappa = new google.maps.Map(div, mapOptions)
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
                draggable: false, // rende il marcatore trascinabile,
            };
            $(".topSection").hide();
            let marcatore = new google.maps.Marker(markerOptions2);
            
            marcatore.addListener("click", function () {
                directionsRenderer.setMap(null)
                console.log("Hi")
                $(".topSection").eq(0).fadeIn(100);
                var directionsService = new google.maps.DirectionsService();
                let coords = item.coord.split(",");
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
                    if (directionsRoutes.status == google.maps.DirectionsStatus.OK) {
                        console.log(directionsRoutes.routes[0]);

                        let renderOptions = {
                            polylineOptions: {
                                strokeColor: "#44F", // colore del percorso
                                strokeWeight: 6, // spessore
                                zIndex: 100, // posizionamento
                            },
                        };
                        directionsRenderer.setMap(mappa); // Collego il renderer alla mappa
                        directionsRenderer.setRouteIndex(0);
                        directionsRenderer.setDirections(directionsRoutes);

                        console.log(
                            directionsRoutes.routes[0].legs[0].duration.text
                        );
                    }
                });

                let container = $(".topSection").eq(0);
                $("<p>").addClass("title").text(item.name).appendTo(container);
                $("<img>").attr("src", item.image[0]).appendTo(container);
                $("<p>").addClass("desc").text(item.description).addClass("subtitle").appendTo(container);
            });

        }
    });
}

function getIndirizzo(coordinate) {
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(coordinate.latitude, coordinate.longitude);
    geocoder.geocode({ location: latlng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            return results[0].formatted_address;
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

function customize() {
    let req = inviaRichiesta("GET", "/api/dbInfo", { username: localStorage.getItem("username") });
    req.fail(errore);
    req.done((data) => {
        // data = JSON.parse(data);
        console.log(data);
        // Accede tramite jQuery ai figli di .user
        $(".user").children().eq(0).attr("src", data.profilePic);
        $(".user").children().eq(1).text(data.nome + " " + data.cognome);
        $(".load").eq(0).fadeOut(200);
    });
}