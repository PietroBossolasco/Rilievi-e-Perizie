window.onload = function() {
    let req = inviaRichiesta("GET", "/api/takeAllUsers");
    req.fail(errore);
    req.done(function(data) {
        data = JSON.parse(data);
        let i = 0;
        for(let item of data) {
            
            let table = $("tbody");
            let tr = $("<tr>").appendTo(table);
            i++;
            if(i%2 == 0)
                tr.addClass("gray").appendTo("tbody");
            $("<td>").text(item.username).appendTo(tr);
            $("<td>").text(item.nome).appendTo(tr);
            $("<td>").text(item.cognome).appendTo(tr);
            $("<td>").text(item.email).appendTo(tr);
            $("<td>").append($("<a>").attr("href", item.profilePic).text("Immagine profilo")).appendTo(tr);
        };
    });
};