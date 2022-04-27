//server.js a été defini comme entry-point lors de l'installation du package json.
//le package nodemon a été installé pour actualiser le serveur en temps réel.

//import du package http (qui va écouter et répondre à des requêtes http) et du fichier app.js.
const http = require("http");
const app = require("./app");

//la fonction normalizePort renvoie un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaîne.
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
//utilisation de la fonction .set pour dire à l'application sur quel port elle va tourner:
//le port environnement ou le port 3000.
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

//la fonction errorHandler recherche les différentes erreurs et les gère de manière appropriée.
//Elle est ensuite enregistrée dans le serveur.
const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

//création du server avec la méthode createServer du package http qui prend comme argument...
//...la fonction (app) qui sera appelée à chaque requête issues du serveur.
const server = http.createServer(app);

//écouteur d'évènements qui consigne le port ou le canal nommé sur lequel le server s'exécute dans la console.
server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

//on demande au serveur d'écouter la constante "port"
server.listen(port);
