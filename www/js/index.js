/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);
window.screen.orientation.lock('portrait');
let userData = {};

let base64image;
let commentImge;

function onDeviceReady() {
    if (localStorage.getItem("username") == null || localStorage.getItem("logged") == "false" || localStorage.getItem("logged") == null)
        window.location.href = "/login.html";
    else {
        custom();
        newPer();
        verifypassword();

        $(".home").eq(0).on("click", function () {
            if ($(".page").eq(0).hasClass("hidden")) {
                $(".page").eq(0).removeClass("hidden");
                $(".page").eq(1).addClass("hidden");
                $(".page").eq(2).addClass("hidden");
                $(".home").eq(0).css("background-image", "url(../img/homeselected.svg)");
                $(".profile").eq(0).css("background-image", "url(../img/usernotselected.svg)");
            }
        });

        $(".profile").eq(0).on("click", function () {
            if ($(".page").eq(1).hasClass("hidden")) {
                $(".page").eq(1).removeClass("hidden");
                $(".page").eq(0).addClass("hidden");
                $(".page").eq(2).addClass("hidden");
                $(".profile").eq(0).css("background-image", "url(../img/userselected.svg)");
                $(".home").eq(0).css("background-image", "url(../img/homenotselected.svg)");
            }
        });

        $(".nuovaPerizia").eq(0).on("click", function () {
            $(".page").eq(0).addClass("hidden");
            $(".page").eq(2).removeClass("hidden");
        });

        $(".logout").eq(0).on("click", function () {
            localStorage.setItem("logged", "false");
            localStorage.setItem("username", "");
            localStorage.setItem("password", "");
            window.location.href = "/login.html";
        });
    }
}

function verifypassword() {
    let req = inviaRichiesta("GET", "/api/dbInfo", { username: localStorage.getItem("username") });
    req.fail(errore);
    req.done(function (data) {
        if(data.first){
            Swal.fire({
                title: 'Cambia la password',
                input: 'password',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: false,
                confirmButtonText: 'Cambia',
                showLoaderOnConfirm: true,
                preConfirm: (password) => {
                    let req = inviaRichiesta("POST", "/api/changePassword", { "username": localStorage.getItem("username"), "password": password, changeFirst: true });
                    req.fail(errore);
                    req.done(function (data) {
                        Swal.fire({
                            title: 'Password cambiata',
                            text: 'La tua password è stata cambiata con successo',
                            icon: 'success',
                            confirmButtonText: 'Ok'
                        });
                    });
                },
                allowOutsideClick: () => !Swal.isLoading()
            });
        }
    });
}

function custom() {
    let req = inviaRichiesta("GET", "/api/dbInfo", { "username": localStorage.getItem("username") });
    req.fail(errore);
    req.done(function (data) {
        userData = data;
        console.log(data);
        $(".wel").eq(0).text("Benvenuto " + data.nome);
        $(".profilePicture").eq(0).css("background-image", "url(" + data.profilePic + ")");
        $(".namesur").eq(0).text(data.nome + " " + data.cognome);
        localStorage.setItem("id", data._id);

        let req = inviaRichiesta("GET", "/api/requestPerizieByIdLimit", { "userId": data._id});
        req.fail(errore);
        req.done(function (data) {
            console.log(data);
            let max = 3;
            if (data.length < 3)
                max = data.length;

            for (let i = 0; i < max; i++) {
                let div = $("<div>");
                div.addClass("card");
                $("<p>").addClass("cardTitle").text(data[i].name).appendTo(div);
                $("<p>").addClass("cardDate").text(data[i].date + ", " + data[i].hour).appendTo(div);
                div.appendTo(".perizie").eq(0);
            }

            $(".load").fadeOut(100);
        })
    });
}

function newPer() {
    base64image = [];
    commentImge = [];

    let datiPerizia = {
        "userId": localStorage.getItem("id"),
        "date" : null,
        "hour" : null,
        "coord" : null,
        "name" : null,
        "description" : null,
        "image" : null,
        "imageComment" : null
    }

    $(".pos").eq(0).on("click", function () {
        let gpsOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }

        let watchID = navigator.geolocation.watchPosition((position) => {
            $(".page").eq(2).children("input").eq(4).val(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
            datiPerizia.coord = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
            navigator.geolocation.clearWatch(watchID);
        }, () => {
            Swal.fire(
                'Errore',
                'Errore nel rilevamento della posizione',
                'error'
            )
        }, gpsOptions)
    })

    $(".now").eq(0).on("click", function () {
        let cameraOptions = {
            destinationType: Camera.DestinationType.DATA_URL,
            correctOrientation: true,
            encodingType: Camera.EncodingType.JPEG,
        }

        cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
        let request = navigator.camera.getPicture((imageData) => {
            $("<div>").addClass("pos").text("Carica Foto e commento").appendTo("#load").eq(2).on("click", function(){
                console.log("click")
                base64image.push("data:image/jpeg;base64," + imageData);
                commentImge.push($(".page").eq(2).children("input").eq(5).val());
                $(".image").eq(0).attr("src", "");
                $(".page").eq(2).children("input").eq(5).val("");
                $(".pos").eq(1).show();
                $(".now").eq(0).show();
                $(this).remove();
            })
            console.log("Selected image: " + imageData)
            $(".image").eq(0).attr("src", "data:image/jpeg;base64," + imageData);
            datiPerizia.image = "data:image/jpeg;base64," + imageData;
            $(".pos").eq(1).hide();
            $(".now").eq(0).hide();
            $(".page").eq(2).children("p").eq(6).hide();
        }, () => {
            Swal.fire(
                'Errore',
                'Errore nell\' accesso alla fotocamera',
                'error'
            )
        }, cameraOptions)
    });

    $(".pos").eq(1).on("click", function () {
        let cameraOptions = {
            destinationType: Camera.DestinationType.DATA_URL,
            correctOrientation: true,
            encodingType: Camera.EncodingType.JPEG,
        }

        cameraOptions.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        let request = navigator.camera.getPicture((imageData) => {
            $("<div>").addClass("pos").text("Carica Foto e commento").appendTo($("#load")).on("click", function(){
                console.log("click")
                base64image.push("data:image/jpeg;base64," + imageData);
                commentImge.push($(".page").eq(2).children("input").eq(5).val());
                $(".image").eq(0).attr("src", "");
                $(".page").eq(2).children("input").eq(5).val("");
                $(".pos").eq(1).show();
                $(".now").eq(0).show();
                $(".page").eq(2).children("p").eq(5).text("Immagini (caricate " + base64image.length + ")");
                $(".page").eq(2).children("p").eq(6).show();
                $(this).remove();
            })

            $(".pos").eq(2).on("click", ()=>{
                console.log("ciao")
            })

            console.log("Selected image: " + imageData)
            $(".image").eq(0).attr("src", "data:image/jpeg;base64," + imageData);
            datiPerizia.image = "data:image/jpeg;base64," + imageData;
            $(".pos").eq(1).hide();
            $(".now").eq(0).hide();
            $(".page").eq(2).children("p").eq(6).hide();
        }, () => {
            Swal.fire(
                'Errore',
                'Errore nell\' accesso alla galleria',
                'error'
            )
        }, cameraOptions)
    });

    $(".line").eq(0).children(".button").eq(1).on("click", function () {
    
        let urls = [];

        let i = 0;
        for(let item of base64image){
            let uploadImage = inviaRichiesta("POST", "/api/base64Cloudinary", {"img": item, "username": localStorage.getItem("username")});
            uploadImage.fail(errore);
            uploadImage.done(function (data) {
                i++;
                if(i == base64image.length){
                    urls.push(data.url);
                    uploadPerizia();
                }
            });
        }

        function uploadPerizia(){
            let datiPerizia = {
                "userId": localStorage.getItem("id"),
                "date" : $(".page").eq(2).children("input").eq(2).val(),
                "hour" : $(".page").eq(2).children("input").eq(3).val(),
                "coord" : $(".page").eq(2).children("input").eq(4).val(),
                "name" : $(".page").eq(2).children("input").eq(0).val(),
                "description" : $(".page").eq(2).children("input").eq(1).val(),
                "image" : urls,
                "imageComment" : commentImge
            }
    
            let req = inviaRichiesta("POST", "/api/newPerizia", datiPerizia);
            req.fail(errore);
            req.done(function (data) {
                console.log(data);
                Swal.fire(
                    'Perizia creata',
                    'La perizia è stata creata con successo',
                    'success'
                )
                $(".page").eq(2).children("input").eq(0).val("");
                $(".page").eq(2).children("input").eq(1).val("");
                $(".page").eq(2).children("input").eq(2).val("");
                $(".page").eq(2).children("input").eq(3).val("");
                $(".page").eq(2).children("input").eq(4).val("");
                $(".page").eq(2).children("input").eq(5).val("");
                $(".image").eq(0).attr("src", "");
                $(".pos").eq(1).show();
                $(".now").eq(0).show();
                $(".page").eq(2).children("p").eq(6).show();
                $(".page").eq(2).hide();
                $(".page").eq(0).show();
            });
        }
    });
}