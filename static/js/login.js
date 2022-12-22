window.onload = function(){
    let btnLogin = $("#btnLogin");

    btnLogin.on("click", async function(){
        let username = $("input").eq(0).val();
        let password = CryptoJS.SHA256($("input").eq(1).val());
        console.log(password)

        let req = inviaRichiesta("POST", "/api/login", { "username": username, "password": password });
        req.fail(errore);
        req.done((data) => {
            console.log(data);
        })

        console.log(response);
    });
}