//import du framework express pour créer un routeur.
const express = require("express");
//création d'un routeur express.
const router = express.Router();

//import du controlleur sauce.
const sauceController = require("../controllers/sauce");
//import des middlewares d'autentification et de gestion des fichiers entrants.
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

//-----------------------------------------------------------------------------------------------
//enregistrement des routes de base sur le routeur ainsi que les middlewares qui y sont utilisés.

//route pour la création d'une sauce.
router.post("/", auth, multer, sauceController.createSauce);

//route pour la modification d'une sauce.
router.put("/:id", auth, multer, sauceController.modifySauce);

//route pour la  suppression d'une sauce.
router.delete("/:id", auth, sauceController.deleteSauce);

//route pour l'affichage d'une sauce.
router.get("/:id", auth, sauceController.getOneSauce);

//route pour l'affichage de la liste complète des sauces.
router.get("/", auth, sauceController.getAllSauces);

//route pour la créations ou la suppression de likes et de dislikes.
router.post("/:id/like", auth, sauceController.likeSauce);

//-----------------------------------------------------------------------------------------------
//export du routeur.
module.exports = router;
