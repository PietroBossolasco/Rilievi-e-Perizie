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

let userData = {};

function onDeviceReady() {
    if(localStorage.getItem("username") == null || localStorage.getItem("logged") == "false" || localStorage.getItem("logged") == null){
        window.location.href = "/login.html";
    }

    // custom();

    $(".home").eq(0).on("click", function(){
        if($(".page").eq(0).hasClass("hidden")){
            $(".page").eq(0).removeClass("hidden");
            $(".page").eq(1).addClass("hidden");
            $(".page").eq(2).addClass("hidden");
            $(".home").eq(0).css("background-image", "url(../img/homeselected.svg)");
            $(".profile").eq(0).css("background-image", "url(../img/usernotselected.svg)");
        }
    });
    
    $(".profile").eq(0).on("click", function(){
        if($(".page").eq(1).hasClass("hidden")){
            $(".page").eq(1).removeClass("hidden");
            $(".page").eq(0).addClass("hidden");
            $(".page").eq(2).addClass("hidden");
            $(".profile").eq(0).css("background-image", "url(../img/userselected.svg)");
            $(".home").eq(0).css("background-image", "url(../img/homenotselected.svg)");
        }
    });

    $(".nuovaPerizia").eq(0).on("click", function(){
        $(".page").eq(0).addClass("hidden");
        $(".page").eq(2).removeClass("hidden");
    });
}

// async function custom(){
//     let req = inviaRichiesta("GET", "/api/dbInfo", localStorage.getItem("username"));
//     req.fail(errore);
//     req.done(function(data){
//         userData = data;
//         $(".wel").eq(0).text("Benvenuto " + data.username);
//     });
// }