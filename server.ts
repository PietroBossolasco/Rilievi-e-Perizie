import http from "http";
import url from "url";
import fs from "fs";
import dotenv from "dotenv";
import { Collection, Double, MongoClient, ObjectId } from "mongodb";
import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
var bodyParser = require("body-parser");
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fileUpload, { UploadedFile } from "express-fileupload";

const PORT = process.env.PORT || 1337;
dotenv.config({ path: ".env" });
var app = express();
const connectionString: any = process.env.connectionString;
const DBNAME = "Perizie";
const usercollection = "user";
const privateKey = fs.readFileSync("keys/privateKey.pem", "utf8");
dotenv.config({ path: ".env" });
const DURATA_TOKEN = 5000;

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
/* *********************** (Sezione 2) Middleware ********************* */
// 1. Request log
app.use("/", function (req, res, next) {
  console.log("** " + req.method + " ** : " + req.originalUrl);
  next();
});

// 2 - risorse statiche
app.use("/", express.static("./static"));

// 3 - lettura dei parametri post
app.use("/", express.json({ limit: "20mb" }));
app.use("/", express.urlencoded({ extended: true, limit: "20mb" }));

// 4 - binary upload
app.use(
  "/",
  fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 }, // 20*1024*1024 // 20 M
  })
);

// 5 - log dei parametri
app.use("/", function (req, res, next) {
  if (Object.keys(req.query).length > 0)
    console.log("        Parametri GET: ", req.query);
  if (Object.keys(req.body).length != 0)
    console.log("        Parametri BODY: ", req.body);
  next();
});

// 6. cors
app.use("/", cors(corsOptions));

// 7. gestione login
app.post("/api/login", function (req: Request, res: Response, next: any) {
  let connection = new MongoClient(connectionString as string);
  connection
    .connect()
    .then((client: MongoClient) => {
      const collection = client.db(DBNAME).collection(usercollection);
      let regex = new RegExp(`^${req.body.username}$`, "i");
      collection
        .findOne({ username: regex })
        .then((dbUser: any) => {
          if (!dbUser) {
            res.status(401); // user o password non validi
            res.send("Utente non trovato");
          } else {
            //confronto la password
            console.log(req.body.password);
            console.log(dbUser.password);
            bcrypt.compare(
              req.body.password,
              dbUser.password,
              (err: Error, ris: Boolean) => {
                if (err) {
                  res.status(500);
                  res.send("Errore bcrypt " + err.message);
                  console.log(err.stack);
                } else {
                  if (!ris) {
                    // password errata
                    res.status(401);
                    res.send("Password errata");
                  } else {
                    let token = newToken(dbUser);
                    res.setHeader("Authorization", token);
                    // Per permettere le richieste extra domain
                    res.setHeader(
                      "Access-Control-Exspose-Headers",
                      "Authorization"
                    );
                    res.send({ ris: "ok" });
                  }
                }
              }
            );
          }
        })
        .catch((err: Error) => {
          res.status(500);
          res.send("Query error " + err.message);
          console.log(err.stack);
        })
        .finally(() => {
          client.close();
        });
    })
    .catch((err: Error) => {
      res.status(503);
      res.send("Database service unavailable");
    });
});

function createToken(user: any) {
  let time: any = new Date().getTime() / 1000;
  let now = parseInt(time); //Data attuale espressa in secondi
  let payload = {
    iat: user.iat || now,
    exp: now + DURATA_TOKEN,
    _id: user._id,
    username: user.username,
  };
  let token = jwt.sign(payload, privateKey);
  console.log("Creato nuovo token " + token);
  return token;
}

function newToken(user: any) {
  let time: any = new Date().getTime();
  let now = parseInt(time);
  return bcrypt.hashSync(user.username + now, 10);
}

// 8. gestione Logout

// 9. Controllo del Token
app.use("/api", function (req: any, res, next) {
  if (!req.headers["Authorization"]) {
    res.status(403);
    res.send("Token mancante");
  } else {
    let token: any = req.headers.authorization;
    jwt.verify(token, privateKey, (err: any, payload: any) => {
      if (err) {
        res.status(403);
        res.send("Token scaduto o corrotto");
      } else {
        let newToken = createToken(payload);
        res.setHeader("Authorization", token);
        // Per permettere le richieste extra domain
        res.setHeader("Access-Control-Exspose-Headers", "Authorization");
        req["payload"] = payload;
        next();
      }
    });
  }
});

// 10. Apertura della connessione
app.use("/api/", function (req: any, res: any, next: NextFunction) {
  let connection = new MongoClient(connectionString as string);
  connection
    .connect()
    .then((client: any) => {
      req["connessione"] = client;
      next();
    })
    .catch((err: any) => {
      let msg = "Errore di connessione al db";
      res.status(503).send(msg);
    });
});

// Richieste DB
app.get("/api/takeAllUsers", (req: any, res: any, next: any) => {
  console.log("Take all users");
  let db = req.client.db(DBNAME);
  db.collection(usercollection)
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

app.get("/api/setNewUser", (req: any, res: any, next: any) => {
  let db = req.client.db(DBNAME);
  let user = JSON.parse(req.query.user);
  console.log("----");
  console.log(user);

  db.collection(usercollection).insertOne(
    {
      username: user.username,
      nome: user.nome,
      cognome: user.cognome,
      role: user.role,
      password: user.password,
      profilePic: user.profilePic,
      email: user.email,
      token: [],
    },
    (err: any, data: any) => {
      if (err) {
        res.write("Errore esecuzione query " + err.message);
        res.status(401);
      } else {
        console.log(data);
        res.write("ok");
        res.end();
        res.status(200);
      }
    }
  );
});
