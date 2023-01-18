window.onload = function(){
    let btnLogin = $("#btnLogin");

    let setTok = 

    btnLogin.on("click", async function(){
        let username = $("input").eq(0).val();
        let password = CryptoJS.SHA256($("input").eq(1).val()).toString(CryptoJS.enc.Hex)
        console.log(password)

        let req = inviaRichiesta("POST", "/api/login", { "username": username, "password": $("input").eq(1).val() });
        req.fail(() => {
            if(req.status == 401){
                if(data.role != 0){
                    $(".err").eq(0).text("Credenziali non valide");
                    $(".err").eq(0).fadeIn(100);
                }
            }
        }
        );
        req.done((data) => {
        //     data = JSON.parse(data);
        //     console.log(data);
        //     if(data.role != 0){
        //         $(".err").eq(0).text("Non puoi accedere con questo ruolo");
        //         $(".err").eq(0).fadeIn(100);
        //     }
        //     else{
        //         $(".err").eq(0).fadeOut(100);
        //         if((localStorage.getItem("token") != null && localStorage.getItem("token").length == 10) && (localStorage.getItem("username") != null && localStorage.getItem("username").length > 0 && localStorage.getItem("username") == data.username)){
        //             let actualToken = localStorage.getItem("token");
        //             let actualUsername = localStorage.getItem("username");

        //             let req = inviaRichiesta("GET", "/api/deleteToken", { "username": actualUsername });
        //             req.fail(() => {
        //                 console.log("Errore");
        //                 $(".err").eq(0).text("Errore nella richiesta");
        //                 $(".err").eq(0).fadeIn(100);
        //             })
        //             req.done((data) => {
        //                 console.log(data);
        //             })
        //         }else{
        //             let token = generateRandomString(32);
        //             localStorage.setItem("token", token);
        //             localStorage.setItem("username", data.username);
        //             console.log(localStorage.getItem("token"));
        //             let req = inviaRichiesta("GET", "/api/setToken", { "username": data.username, "token": CryptoJS.SHA256(token).toString(CryptoJS.enc.Hex) });
        //             req.fail(() => {
        //                 console.log("Errore");
        //                 $(".err").eq(0).text("Errore nella richiesta");
        //                 $(".err").eq(0).fadeIn(100);
        //             })
        //             req.done((data) => {
        //                 console.log("Token salvato");
        //                 console.log(data);
        //                 // window.location.href = "index.html";
        //             })
        //         }
        //     }
        // })
            console.log("OK, Login effettuato " + data)
        })
    });
}

function generateRandomString(iLen) {
    var sRnd = '';
    var sChrs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    for (var i = 0; i < iLen; i++) {
      var randomPoz = Math.floor(Math.random() * sChrs.length);
      sRnd += sChrs.substring(randomPoz, randomPoz + 1);
    }
    return sRnd;
  }