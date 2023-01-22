window.onload = function () {
  let btnLogin = $("#btnLogin");

  btnLogin.on("click", async function () {
    let username = $("input").eq(0).val();
    let password = CryptoJS.SHA256($("input").eq(1).val()).toString(
      CryptoJS.enc.Hex
    );
    console.log(password);

    let req = inviaRichiesta("POST", "/api/login", {
      username: username,
      password: password,
      platform: "web"
    });
    req.fail(() => {
      console.log(req.status);
      if (req.status == 401) {
        $(".err").eq(0).text("Username o password errati");
        $(".err").eq(0).fadeIn(100);
      } else if (req.status == 503) {
        $(".err").eq(0).text("Errore interno del server");
        $(".err").eq(0).fadeIn(100);
      }else if(req.status == 414){
        $(".err").eq(0).text("Utente non autorizzato");
        $(".err").eq(0).fadeIn(100);
      }
    });
    req.done((data) => {
        data = JSON.parse(data);
      console.log(data);
      if (data.ris == "ok") {
        window.location.href = "index.html";
      }
    });
  });
};
