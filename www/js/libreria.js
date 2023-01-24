function inviaRichiesta(method, url, parameters = {}) {
	let contentType;
	if (method.toUpperCase() == "GET") {
		contentType = "application/x-www-form-urlencoded; charset=UTF-8"
	}
	else {
		contentType = "application/json; charset=utf-8"
		parameters = JSON.stringify(parameters);
	}

	return $.ajax({
		url: "https://10.0.101.92:1338" + url, //default: currentPage
		type: method,
		data: parameters,
		contentType: contentType,
		dataType: "json",
		timeout: 5000,
		beforeSend: function (jqXHR) {
			if ("token" in localStorage) {
				let token = localStorage.getItem("token");
				console.log("SEND -- ", token)
				jqXHR.setRequestHeader("Authorization", token);
			}
		},
		success: function (data, textStatus, jqXHR) {
			let token = jqXHR.getResponseHeader('Authorization')
			console.log("RECEIVE -- ", token)
			localStorage.setItem("token", token)
		}
	});
}



function errore(jqXHR, testStatus, strError) {
	if (jqXHR.status == 0)
		Swal.fire(
			'Errore',
			'Errore di rete, o server non raggiungibile',
			'error'
		)
	else if (jqXHR.status == 200)
		Swal.fire(
			'Errore',
			'Formato dei dati non corretto',
			'error'
		)	
	else if (jqXHR.status == 403) {
		window.location.href = "login.html"
	}
	else
	Swal.fire(
		'Errore',
		'Errore ' + jqXHR.status + '\n' + jqXHR.responseText,
		'error'
	)
}