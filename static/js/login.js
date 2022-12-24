window.onload = function(){
    let btnLogin = $("#btnLogin");

    btnLogin.on("click", async function(){
        let username = $("input").eq(0).val();
        let password = CryptoJS.SHA256($("input").eq(1).val()).toString(CryptoJS.enc.Hex)
        console.log(password)

        let req = inviaRichiesta("GET", "/api/login", { "username": username, "password": password });
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
            data = JSON.parse(data);
            console.log(data);
            if(data.role != 0){
                $(".err").eq(0).text("Non puoi accedere con questo ruolo");
                $(".err").eq(0).fadeIn(100);
            }
            else{
                $(".err").eq(0).fadeOut(100);
                let token = generateRandomString(32);
                localStorage.setItem("token", token);
                localStorage.setItem("username", data.username);
                console.log(localStorage.getItem("token"));
                // window.location.href = "index.html";
            }
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