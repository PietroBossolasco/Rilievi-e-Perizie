import http from "http";
import url from "url";
import fs from "fs";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import express from "express";
import cors from "cors";
var bodyParser = require("body-parser");

const PORT = process.env.PORT || 1337;
dotenv.config({ path: ".env" });
var app = express();
const connectionString: any = process.env.connectionString;
const DBNAME = "Perizie";
const collection = "user";

const corsOptions = {
  origin: function (origin: any, callback: any) {
    return callback(null, true);
  },
  credentials: true,
};

//CREAZIONE E AVVIO DEL SERVER HTTP
let server = http.createServer(app);
let paginaErrore: string = "";

server.listen(PORT, () => {
  init();
  console.log("Server in ascolto sulla porta " + PORT);
  console.log(connectionString);
});

function init() {
  fs.readFile("./static/error.html", (err: any, data: any) => {
    if (err) {
      paginaErrore = "<h2>Risorsa non trovata</h2>";
    } else {
      paginaErrore = data.toString();
    }
  });
}

/***********MIDDLEWARE****************/
// 1 request log
app.use("/", (req: any, res: any, next: any) => {
  console.log(req.method + ": " + req.originalUrl);
  next();
});

//cerca le risorse nella cartella segnata nel path e li restituisce
app.use("/", express.static("./static"));

// Apertura della connessione
app.use("/api/", (req: any, res: any, next: any) => {
  let connection = new MongoClient(connectionString);
  connection
    .connect()
    .catch((err: any) => {
      res.status(503);
      res.send("Errore di connessione al DB");
    })
    .then((client: any) => {
      req["client"] = client;
      next();
    });
});

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

// Richieste DB
app.get("/api/takeAllUsers", (req: any, res: any, next: any) => {
  console.log("Take all users");
  let db = req.client.db(DBNAME);
  db.collection(collection)
    .find({ role: 1 })
    .toArray((err: any, data: any) => {
      if (err) {
        console.log("Errore esecuzione query " + err.message);
        res.write(JSON.stringify(err));
        res.status(401);
      } else {
        res.status(200);
        res.write(JSON.stringify(data));
        res.end();
      }
      req.client.close();
    });
});

app.get("/api/login/", (req: any, res: any, next: any) => {
  let db = req.client.db(DBNAME);
  let email = req.query.username;
  let password = req.query.password;
  console.log("----");
  console.log(email);
  console.log(password);
  console.log("----");

  db.collection(collection).findOne(
    { username: email },
    (err: any, data: any) => {
      if (err) {
        res.status(500);
        res.send("Errore Login");
      } else {
        if (data != null) {
          if (data.password == password && data.username == email) {
            res.status(200);
            res.send(data);
          } else if (data.password != password || data.username != email) {
            res.status(401);
            res.send("Credenziali non valide");
          }
        } else {
          res.status(401);
          res.send("Credenziali non valide");
        }
      }
      req.client.close();
    }
  );
});

app.get("/api/setToken", (req: any, res: any, next: any) => {
  let db = req.client.db(DBNAME);
  let token = req.query.token;
  let username = req.query.username;
  console.log("----");
  console.log(username);
  console.log(token);
  console.log("----");

  db.collection(collection).updateOne(
    { username: username },
    { $push: { token: token } },
    (err: any, data: any) => {
      if (err) {
        console.log("Errore esecuzione query " + err.message);
      } else {
        res.write(JSON.stringify(data));
        res.end();
      }
    }
  );
});

app.get("api/deleteToken", (req: any, res: any, next: any) => {
  let db = req.client.db(DBNAME);
  let token = req.query.token;
  let username = req.query.username;
  console.log("----");
  console.log(username);
  console.log(token);
  console.log("----");

  // Delete the sting "token" from the array
  db.collection(collection).deleteOne(
    { username: username, $elemMatch: { token: token } },
    { $pull: { token: token } },
    (err: any, data: any) => {
      if (err) {
        console.log("Errore esecuzione query " + err.message);
      } else {
        res.write(JSON.stringify(data));
        res.end();
      }
    }
  );
});

app.get("api/setSession", (req: any, res: any, next: any) => {
  let username = req.query.username;
  let key = req.query.key;
  var session = require("express-session");
  app.use(
    session({
      secret: "myKeyword",
      name: "sessionId",
      // proprietà legate allo store
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // true per accessi https
        maxAge: 6000000, // durata in msec
      },
    })
  );
});

app.get("/api/setNewUser", (req: any, res: any, next: any) => {
  let db = req.client.db(DBNAME);
  let user = JSON.parse(req.query.user);
  console.log("----");
  console.log(user);

  db.collection(collection).insertOne({ username : user.username, nome : user.nome, cognome : user.cognome, role : user.role, password : user.password, profilePic : user.profilePic, email : user.email, token : []}, (err: any, data: any) => {
    if (err) {
      res.write("Errore esecuzione query " + err.message)
      res.status(401);
    } else {
      res.write("Utente inserito correttamente");
      res.end();
      res.status(200);
    }
  });
});