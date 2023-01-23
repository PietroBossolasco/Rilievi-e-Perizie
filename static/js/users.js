window.onload = function () {
  customize();
  takeAllUsers();

  $(".addUser").on("click", function () {
    $(".newUser").show();
  });

  $(".leave").on("click", function () {
    let input = $(".newUser input");
    for (let item of input) {
      item.value = "";
    }
    $(".newUser").hide();
  });

  $(".save").on("click", function () {
    let data = {
      username: $(".newUser input").eq(0).val(),
      nome: $(".newUser input").eq(1).val(),
      cognome: $(".newUser input").eq(2).val(),
      email: $(".newUser input").eq(3).val(),
      password: CryptoJS.SHA256("password").toString(CryptoJS.enc.Hex),
      profilePic: $(".newUser input").eq(4).val(),
      role: parseInt($(".newUser select").eq(0).val()),
    };
    console.log(data);

    let req = inviaRichiesta("GET", "/api/setNewUser", {
      user: JSON.stringify(data),
    });
    req.fail(errore);
    req.done(function (data) {
      let input = $(".newUser input");
      for (let item of input) {
        item.value = "";
      }
      $(".newUser").hide();
      Swal.fire({
        title: "Utente inserito con successo",
        icon: "success",
        showCloseButton: true,
      });
      takeAllUsers();
    });
  });
};

async function takeAllUsers() {
  let req = inviaRichiesta("GET", "/api/takeAllUsers");
  req.fail(errore);
  req.done(function (data) {
    // data = JSON.parse(data);
    let i = 0;
    let table = $("tbody");
    table.empty();
    for (let item of data) {
      let tr = $("<tr>").appendTo(table);
      i++;
      if (i % 2 == 0) tr.addClass("gray").appendTo("tbody");
      $("<td>").text(item.username).appendTo(tr);
      $("<td>").text(item.nome).appendTo(tr);
      $("<td>").text(item.cognome).appendTo(tr);
      $("<td>").text(item.email).appendTo(tr);
      $("<td>")
        .append($("<a>").attr("href", item.profilePic).text("Immagine profilo"))
        .appendTo(tr);
    }
  });
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