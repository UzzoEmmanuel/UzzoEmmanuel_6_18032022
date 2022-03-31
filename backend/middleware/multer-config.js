//installation et import du package multer pour gérer les fichiers entrants: pour télécharger des images de sauces.
const multer = require("multer");

//-----------------------------------------------------------------------------------------------
//création d'un dictionnaire de MIME_TYPES pour générer des extensions de fichiers.
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

//-----------------------------------------------------------------------------------------------
//creéation d'objet de configuration pour multer
//fonction .diskStorage pour enregistrer l'objet.
const storage = multer.diskStorage({
  //stockage des objets dans le dossier "image" du backend.
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  //définition du nom du fichier enregistré.
  filename: (req, file, callback) => {
    //création d'un nouveau nom pour le fichier:
    //on utilise le nom original du fichier et on remplace les espaces par des underscores.
    const name = file.originalname.split(" ").join("_");
    //puis on applique une extension en utilisant les MIME_Types des fichiers.
    const extension = MIME_TYPES[file.mimetype];
    //on appel le callback pour créer le nom du fichier et on ajoute un timestamp.
    callback(null, name + Date.now() + "." + extension);
  },
});

//-----------------------------------------------------------------------------------------------
//export du middleware auquel on applique la fonction .single afin de signaler que celui-ci est unique.
module.exports = multer({ storage: storage }).single("image");
