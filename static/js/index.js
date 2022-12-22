"use strict";

window.onload = async function(){
    loadGoogleApi().then(setMap)
}

function setMap(){
    var div = document.getElementsByClassName("cardArea")[0];
    var posizione = new google.maps.LatLng(44.5558363,7.733851);
    var mapOptions = {
    center:posizione,
    zoom:16,
        mapTypeId: google.maps.MapTypeId.ROADMAP // default=ROADMAP
    };
    var mappa = new google.maps.Map(div, mapOptions); 

    var icon1 = {
        url: '/img/marker.png',
        scaledSize: new google.maps.Size(30, 40), // dimensioni
        // anchor: new google.maps.Point(30, 40), // posizione
        // origin: new google.maps.Point(0,0), // file con icone multiple
    }
        

    let markerOptions = {
        map:mappa,
        position:posizione,
        title:"IIS Vallauri", // tooltip
        label:"", // lettera maiuscola singola
        icon:icon1, // complex icon
        zIndex: 3, // in caso di marcatori vicini/sovrapposti
        animation: google.maps.Animation.DROP, // .BOUNCE oscilla
        draggable:false, // rende il marcatore trascinabile
        }

        let marcatore1 = new google.maps.Marker(markerOptions)
        
        let markerOptions2 = {
            map:mappa,
            position:new google.maps.LatLng(44.6558363,7.733851),
            title:"IIS Vallauri", // tooltip
            label:"", // lettera maiuscola singola
            icon:icon1, // complex icon
            zIndex: 3, // in caso di marcatori vicini/sovrapposti
            animation: google.maps.Animation.DROP, // .BOUNCE oscilla
            draggable:false, // rende il marcatore trascinabile
            }

            new google.maps.Marker(markerOptions2)
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
		script.onerror = function() {reject(new Error("errore sul caricamento"))}
	})
}