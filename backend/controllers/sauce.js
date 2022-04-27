//import du modèle "sauce".
const Sauce = require("../models/Sauce");
//import du package node fs qui donne accès aux fonctions permattant de modifier le système de fichiers.
const fs = require("fs");

//-----------------------------------------------------------------------------------------------
//export de la fonction qui retourne la liste complète des sauces.
exports.getAllSauces = (req, res, next) => {
  //méthode .find sans paramètres pour retourner toutes les sauces.
  Sauce.find()
    //réponse avec les codes 200(succés) ou 400(erreur).
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error: error }));
};

//-----------------------------------------------------------------------------------------------
//export de la fonction qui retourne une sauce de la liste.
exports.getOneSauce = (req, res, next) => {
  //methode .findOne pour trouver un élément avec un paramètre de route dynamique (l'id).
  Sauce.findOne({ _id: req.params.id }) //objet de comparaison: on veut que l'id de la sauce soit égual au paramètre de requête.
    //réponse avec les codes 200(succés) ou 404(objet non trouvé).
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error: error }));
};

//-----------------------------------------------------------------------------------------------
//export de la fonction qui permet de créer une nouvelle sauce.
exports.createSauce = (req, res, next) => {
  //transforamtion de la chaîne de caractère js en objet avec la méthode JSON.parse.
  const sauceObject = JSON.parse(req.body.sauce);
  //suppression de l'id généré par le frontend car mongodb va s'occuper d'en générer un nouveau.
  delete sauceObject._id;

  //validation des champs du formulaire avec une regex,
  //l'intention ici est d'éviter les champs de moins de 3 caractères.
  let inputRegex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
  if (
    !inputRegex.test(sauceObject.name) ||
    !inputRegex.test(sauceObject.manufacturer) ||
    !inputRegex.test(sauceObject.description) ||
    !inputRegex.test(sauceObject.mainPepper)
  )
    return res.status(500).json({ message: "champ(s) non valide(s)" });

  const sauce = new Sauce({
    ...sauceObject, //opérateur spread (...) fait une copie de tous les éléments de req.body.
    //création d'une chaîne complexe pour donner au frontend l'url de l'image.
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    //enregistrement de l'objet dans la base de données qui retourne une promesse.
    .save()
    //réponse au frontend pour éviter l'expiration de la requête avec les codes 201(création de donnée(s))...
    //...ou 400(code erreur).
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error })); //error = error: error
};

//-----------------------------------------------------------------------------------------------
//export de la fonction qui permet de modifier une sauce.
exports.modifySauce = (req, res, next) => {
  //2 cas possible: si on modifie l'image ou pas.

  //suppression de l'ancienne image si l'utilisateur en soumet une nouvelle.
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then((image) => {
        const filename = image.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) throw error;
        });
      })
      .catch((error) => res.status(404).json({ error: error }));
  }

  const sauceObject = req.file
    ? //opérateur ternaire:
      //req.file existe et on modifie l'image.
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : //req.file n'existe pas et on traite l'objet entrant.
      { ...req.body };

  //validation des champs du formulaire avec une regex,
  //l'intention ici est d'éviter les champs de moins de 3 caractères.
  let inputRegex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
  if (
    !inputRegex.test(sauceObject.name) ||
    !inputRegex.test(sauceObject.manufacturer) ||
    !inputRegex.test(sauceObject.description) ||
    !inputRegex.test(sauceObject.mainPepper)
  )
    return res.status(500).json({ message: "champ(s) non valide(s)" });

  //méthode .update pour mettre à jour un élément avec deux arguments:
  Sauce.updateOne(
    { _id: req.params.id, userId: req.auth.userId }, //objet de comparaison: on veut que l'id de la sauce soit égual au paramètre de requête.
    { ...sauceObject, _id: req.params.id } //nouvelle version de la sauce.
  )
    //réponse avec les codes 200(succés) ou 400(erreur).
    .then(() => res.status(200).json({ message: "Sauce modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

//-----------------------------------------------------------------------------------------------
//export de la fonction qui permet de supprimer une sauce.
exports.deleteSauce = (req, res, next) => {
  //methode .findOne pour trouver un élément avec un paramètre de route dynamique (l'id).
  Sauce.findOne({ _id: req.params.id, userId: req.auth.userId })
    .then((sauce) => {
      //extraire le nom du fichier pour supprimer l'image.
      const filename = sauce.imageUrl.split("/images/")[1];
      //fonction .unlike supprime un fichier.
      fs.unlink(`images/${filename}`, () => {
        //méthode deleteOne pour supprimer un élément.
        Sauce.deleteOne({ _id: req.params.id }) //objet de comparaison: on veut que l'id de la sauce soit égual au paramètre de requête.
          //réponse avec les codes 200(succés) ou 400(erreur).
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    //réponse avec le code 500(erreur serveur).
    .catch((error) => res.status(500).json({ error }));
};

//-----------------------------------------------------------------------------------------------
//export de la fonction qui permet d'ajouter et d'enlever des likes et des dislikes.
exports.likeSauce = (req, res, next) => {
  //utilisation de la méthode js includes() et des opérateurs mongodb $inc, $push et $pull.
  Sauce.findOne({ _id: req.params.id }) //objet de comparaison: on veut que l'id de la sauce soit égual au paramètre de requête.
    .then((sauce) => {
      //mettre un like.
      //si la sauce n'est pas likée par l'utilisateur.
      if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
        Sauce.updateOne(
          //on incrémente de 1 les likes et on inclut l'id de l'utilisateur dans le tableau des likes.
          { _id: req.params.id },
          { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
        )
          //réponse au frontend pour éviter l'expiration de la requête avec les codes 201(création de donnée(s))...
          //...ou 400(code erreur).
          .then(() => res.status(201).json({ message: "+1 like !" }))
          .catch((error) => res.status(400).json({ error }));
      }

      //enlever un like.
      //si la sauce est déjà likée par l'utilisateur.
      if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            //on décrémente de 1 les likes et on enlève l'id de l'utilisateur du tableau des likes.
            $inc: { likes: -1 },
            $pull: { usersLiked: req.body.userId },
          }
        )
          //réponse au frontend pour éviter l'expiration de la requête avec les codes 201(création de donnée(s))...
          //...ou 400(code erreur).
          .then(() => res.status(201).json({ message: "-1 like..." }))
          .catch((error) => res.status(400).json({ error }));
      }

      //mettre un dislike.
      //si la sauce n'est pas dislikée par l'utilisateur.
      if (
        !sauce.usersDisliked.includes(req.body.userId) &&
        req.body.like === -1
      ) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            //on incrémente de 1 les dislikes et on inclut l'id de l'utilisateur dans le tableau des dislikes.
            $inc: { dislikes: 1 },
            $push: { usersDisliked: req.body.userId },
          }
        )
          //réponse au frontend pour éviter l'expiration de la requête avec les codes 201(création de donnée(s))...
          //...ou 400(code erreur).
          .then(() => res.status(201).json({ message: "+1 dislike..." }))
          .catch((error) => res.status(400).json({ error }));
      }

      //enlever un dislike.
      //si la sauce est déjà dislikée par l'utilisateur.
      if (
        sauce.usersDisliked.includes(req.body.userId) &&
        req.body.like === 0
      ) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            //on décrémente de 1 les dislikes et on enlève l'id de l'utilisateur du tableau des dislikes.
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: req.body.userId },
          }
        )
          //réponse au frontend pour éviter l'expiration de la requête avec les codes 201(création de donnée(s))...
          //...ou 400(code erreur).
          .then(() => res.status(201).json({ message: "-1 dislike !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    //code erreur 404(objet non trouvé).
    .catch((error) => res.status(404).json({ error }));
};
