//import du modèle "user".
const User = require("../models/User");
//installation du package de cryptage de mot de passe puis import du plugin bcrypt.
const bcrypt = require("bcrypt");
//installation du package d'authentification puis import du plugin jsonwebtoken.
//permet la création de token ainsi que leur identification.
const jwt = require("jsonwebtoken");

//-----------------------------------------------------------------------------------------------
//export de la fonction qui permet de créer une nouvel utilisateur.
exports.signup = (req, res, next) => {
  //fonction asynchrone pour crypter le mot de passe.
  bcrypt
    //le mot de passe est haché 10 fois.
    .hash(req.body.password, 10)
    //le mot de passe haché est enregistré avec l'email dans la base de données.
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        //enregistrement de l'objet dans la base de données qui retourne une promesse.
        .save()
        //réponse au frontend pour éviter l'expiration de la requête avec les codes 201(création de donnée(s))...
        //...ou 400(code erreur).
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    //réponse avec le code 500(erreur serveur).
    .catch((error) => res.status(500).json({ error }));
};

//-----------------------------------------------------------------------------------------------
//export de la fonction qui permet d'authentifier un utilisateur.
exports.login = (req, res, next) => {
  //methode .findOne pour trouver l'utilisateur dasn la base de données...
  //...qui correspond à l'email qui est entré dans le formulaire.
  User.findOne({ email: req.body.email }) //objet de comparaison: on veut que l'email de la requête correspond à un email de la base de données.
    .then((user) => {
      //si l'utilisateur n'est pas trouvé, réponse avec le code erreur 401(non autorisé).
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      //l'utilisateur est trouvé, on utilise bcrypt pour comparer le mot de passe saisie et celui enregistré dans la base de données.
      bcrypt
        .compare(req.body.password, user.password)
        //réponse: booléen.
        .then((valid) => {
          //si le mot de passe est incorrect, réponse avec le code erreur 401(non autorisé).
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          //sinon réponse avec un code 200(succés).
          res.status(200).json({
            //reponse avec l'id de l'utilisateur et un token crypté.
            userId: user._id,
            //fonction .sign qui prend comme arguments l'id de l'utilisateur, une clé secrète et une expiration.
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        //réponse avec le code 500(erreur serveur).
        //problème de connexion.
        .catch((error) => res.status(500).json({ error }));
    })
    //réponse avec le code 500(erreur serveur).
    //utilisateur non trouvé.
    .catch((error) => res.status(500).json({ error }));
};
