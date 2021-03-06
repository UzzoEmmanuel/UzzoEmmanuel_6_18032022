//installation du package puis import du framework express permettant l'utilisation de middleware.
const express = require("express");
//installation du package puis import du framework mongoose qui facilite les inétractions avec la base de donnée mongodb.
const mongoose = require("mongoose");
//import du package node permettant l'accés au chemin du système de fichiers.
const path = require("path");
//installation puis import du package helmet permettant de sécuriser certaines vulnérabilités des applications express en configurant des headers http.
const helmet = require("helmet");
//installation et import du package cors popur prévenir les erreurs de cors (sysème de sécurité qui bloque par défaut les appels http entre des serveurs différents).
const cors = require("cors");
//installation puis import du package dotenv afin de sécurisé le password d'accés à mongodb.
//le password est stocké dans le fichier .env qui ne sera pas versionné sur git (voir fichier gitignore).
require("dotenv").config();

//import des routeur qui gérant respectivement les routes du modèle sauce et user.
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

//-----------------------------------------------------------------------------------------------

//connexion à la base de donnée mongodb
mongoose
  .connect(process.env.SECRET_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

//-----------------------------------------------------------------------------------------------

//appel de la méthode express pour pouvoir créer une application express.
const app = express();

//installation d'helmet sur l'application.
helmet({
  crossOriginResourcePolicy: false,
});

//appel du plugin cors.
app.use(cors());

//middleware pour prévenir les erreurs de cors :
//la fonction suivante permet aux port 3000 et 8080 de pouvoir communiquer grace aux headers...
//...qui signalent au navigateur que dans le cas suivant il ne s'agit d'une pratique malveillante.
app.use((req, res, next) => {
  //header permettant d'accéder à l'api depuis n'importe quelle origine.
  res.setHeader("Access-Control-Allow-Origin", "*");
  //header permettant d'ajouter les headers mentionnés aux requêtes envoyées vers l'api.
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  //header permettant d'envoyer des requêtes avec les méthodes mentionnées.
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  //next passe l'exécution au middleware suivant.
  next();
});

//utilisation de la fonction .use pour fournir à l'application de quoi répondre au serveur.
//le middleware express suivant prend toutes les requêtes qui ont comme content-type application/json...
//...et met à disposition leur  body  directement sur l'objet req.
app.use(express.json());

//utilisation de la fonction .use pour que l'application gère les requêtes de fichiers.
//express.static permet de gérer les dossiers statiques.
//on utilise ensuite méthode path.join auquel on passe le nom du dossier (__dirname).
app.use("/images", express.static(path.join(__dirname, "images")));

//utilisation de la fonction .use pour enregistrer que pour tel ou tel route on utilise tel ou tel routeur.
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

//export de l'appllication pour pouvoir y accéder dans d'autres fichiers
module.exports = app;
