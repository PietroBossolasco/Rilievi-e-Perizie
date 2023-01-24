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
import cloudinary, { UploadApiResponse } from "cloudinary";
import { Console } from "console";
import https from "https";
import axios from "axios";

let info;
let tokensave: string = "";
let dbsaved: any;

cloudinary.v2.config({
  cloud_name: "dsqtbo9tc",
  api_key: "828771716444647",
  api_secret: "4eDuUSvPOLgakp3YfUOvm6Xe6hQ",
 }); 

const PORT = process.env.PORT || 1337;
const HTTPS_PORT = 1338
dotenv.config({ path: ".env" });
var app = express();
const connectionString: any = process.env.connectionString;
const DBNAME = "Perizie";
const usercollection = "user";
const privateKey = fs.readFileSync("keys/privateKey.pem", "utf8");
const symmetricKey = fs.readFileSync("keys/symmetricKey.pem", "utf8");
const certificate = fs.readFileSync("keys/certificate.crt", "utf8");
const credentials = { "key": privateKey, "cert": certificate };
dotenv.config({ path: ".env" });
const DURATA_TOKEN = 5000000;

const corsOptions = {
  origin: function (origin: any, callback: any) {
    return callback(null, true);
  },
  credentials: true,
};
const whitelist = ["http://localhost:1337", "https://localhost:1338"]

//CREAZIONE E AVVIO DEL SERVER HTTP
let server = http.createServer(app);
server.listen(PORT, () => {
  init();
  console.log("Server http in ascolto sulla porta " + PORT);
  console.log(connectionString);
});
let httpsServer = https.createServer(credentials, app);
httpsServer.listen(HTTPS_PORT, function () {
  console.log("Server HTTPS:" + HTTPS_PORT);
});

let paginaErrore: string = "";



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
  let platform = req.body.platform;
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
            if (
              (dbUser.role != 1 && platform == "mobile") ||
              (dbUser.role != 0 && platform == "web")
            ) {
              res.status(414); // user o password non validi
              res.send("Utente non autorizzato");
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
                      res.send("Wrong password");
                    } else {
                      let token = createToken(dbUser);
                      res.setHeader("authorization", token);
                      // Per permettere le richieste extra domain
                      res.setHeader(
                        "Access-Control-Expose-Headers",
                        "authorization"
                      );
                      res.send({ ris: token });
                    }
                  }
                }
              );
            }
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
  let token = jwt.sign(payload, symmetricKey);
  console.log("Creato nuovo token " + token);
  return token;
}

// 8. gestione Logout
app.get("/api/logout", function (req: any, res, next) {
  req.headers["authorization"] = "";
});

// 9. Controllo del Token
app.use("/api/", function (req: any, res, next) {
  // console.log("HEADERS: " + req.headers["authorization"])
  // if (!req.headers["authorization"]) {
  //   res.status(403);
  //   res.send("Token mancante");
  // } else {
  //   let token: any = req.headers.authorization;
  //   jwt.verify(token, privateKey, (err: any, payload: any) => {
  //     if (err) {
  //       res.status(403);
  //       res.send("Token scaduto o corrotto");
  //     } else {
  //       let newToken = createToken(payload);
  //       res.setHeader("Authorization", newToken);
  //       // Per permettere le richieste extra domain
  //       res.setHeader("Access-Control-Expose-Headers", "authorization");
  //       req["payload"] = payload;
  next();
  //     }
  //   });
  // }
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

app.get("/api/info", (req: any, res: any, next: any) => {
  res.write(JSON.stringify(info));
  res.end();
  res.status(200);
});

app.get("/api/dbInfo", (req: any, res: any, next: any) => {
  console.log("Take all users yahiii " + req.query.username);
  let db = req.client.db(DBNAME);
  db.collection(usercollection).findOne(
    { username: req.query.username },
    (err: any, data: any) => {
      if (err) {
        res.write("Errore esecuzione query " + err.message);
        res.status(401);
      } else {
        console.log("user " + data);
        res.write(JSON.stringify(data));
        res.end();
        res.status(200);
      }
    }
  );
});



app.post("/api/newPerizia", (req: any, res: any, next: any) => {
  let collection = req["connessione"].db(DBNAME).collection("perizie");
  collection.insertOne(req.body, (err: any, data: any) => {
    if (err) {
      res.status(500);
      res.send("Errore inserimento record");
    } else {
      res.send(data);
    }
    req["connessione"].close();
  });
});

app.get("/api/requestPerizieByIdLimit", (req: any, res: any, next: any) => {
  let collection = req["connessione"].db(DBNAME).collection("perizie");
  if(req.query.userId){
    collection.find({ userId : req.query.userId }).sort({data: -1}).toArray((err: any, data: any) => {
      if (err) {
        res.status(500);
        res.send("Errore inserimento record");
      } else {
        res.send(data);
        res.status(200);
      }
      req["connessione"].close();
    });
  }
  else if(!req.query.userId && !req.query.username){
    collection.find().sort({data: -1}).toArray((err: any, data: any) => {
      if (err) {
        res.status(500);
        res.send("Errore inserimento record");
      } else {
        res.send(data);
        res.status(200);
      }
      req["connessione"].close();
    });
  }else if (req.query.username){
    collection.find({ username : req.query.username }).sort({data: -1}).toArray((err: any, data: any) => {
      if (err) {
        res.status(500);
        res.send("Errore inserimento record");
      } else {
        res.send(data);
        res.status(200);
      }
      req["connessione"].close();
    });
  }
})

app.get("/api/ultimePerizie", (req: any, res: any, next: any) => {
  console.log("ULTIME PERIZIE")
  let collection = req["connessione"].db(DBNAME).collection("perizie");
  collection.find().sort({data: -1}).limit(3).toArray((err: any, data: any) => {
    if (err) {
      res.status(500);
      res.send("Errore inserimento record");
    } else {
      res.send(data);
      res.status(200);
    }
    req["connessione"].close();
  });
});

app.post("/api/base64Cloudinary", (req: any, res: any, next: any) => {
  if (!req.body.username || !req.body.img) {
    res.status(404);
    res.send("File or username is missed");
  } else {
    cloudinary.v2.uploader
      .upload(req.body.img, { folder: "perizie" , use_filename: true})
      .then((result: UploadApiResponse) => {
        let record = {
          username: req.body.username,
          img: result.secure_url,
        };
        res.status(200);
        res.send({ url: result.secure_url});
      })
      .catch((err: any) => {
        res.status(500);
        res.send("Error upload file to Cloudinary. Error: " + err.message);
      });
  }
});


// Default route
app.use("/", function (req: any, res: any, next: NextFunction) {
  res.status(404);
  if (req.originalUrl.startsWith("/api/")) {
    res.send("Risorsa non trovata");
    req["connessione"].close();
  } else res.send(paginaErrore);
});
