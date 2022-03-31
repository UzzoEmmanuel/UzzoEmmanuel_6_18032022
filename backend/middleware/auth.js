//import du package jsonwebtoken.
const jwt = require("jsonwebtoken");

//-----------------------------------------------------------------------------------------------
//export du middleware d'authentification.
module.exports = (req, res, next) => {
  //utilisation du bloc try et catch : le bloc try est exécuté en premier mais à la moindre erreur dans celui-ci,
  //le bloc catch prendra le relais sans "tué" le script.
  try {
    //récupération du token qui est le second élément l'autorisation du header de la requête.
    const token = req.headers.authorization.split(" ")[1];
    //fonction .verify de jsonwebtoken pour décoder le token.
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    //on récupère un objet js dont on peut récupérer l'id de l'utilisateur.
    const userId = decodedToken.userId;
    //on rajoute l'id de l'utilsateur à l'objet requête.
    req.auth = { userId }; // userId = userId: userId.
    //si on a un id dans la requête et que celui-ci et différent de l'id de l'utilisateur.
    if (req.body.userId && req.body.userId !== userId) {
      //l'instruction throw stoppe l'exécution de la fonction et renvoi l'erreur au bloc catch.
      throw "User ID non valide !";
    } else {
      //sinon tout est ok et on passe la requête au middleware suivant.
      next();
    }
  } catch {
    //réponse avec le code 401(non autorisé).
    res.status(401).json({
      error: new Error("Requête non authentifiée !"),
    });
  }
};
