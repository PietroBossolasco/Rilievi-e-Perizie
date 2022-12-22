import http from "http";
import url from "url";
import fs from "fs";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import express from "express";
import cors from "cors";

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

// Richieste DB
app.post("/api/login", cors(corsOptions), (req: any, res: any) => {
  // let query = url.parse(req.url, true).query;
  let username = req.query.username;
  let password = req.query.password;
  let client = req["client"];
  let db = client.db(DBNAME);
  let mail = db.collection(collection);
  mail.find({
      username: username,
      password: password,
    })
    .toArray()
    .then((result: any) => {
      if (result.length > 0) {
        res.status(200);
        res.send(result);
      } else {
        res.status(404);
        res.send("Email o password errati");
      }
    })
});