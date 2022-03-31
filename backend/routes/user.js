//import du framework express pour créer un routeur.
const express = require("express");
//création d'un routeur express.
const router = express.Router();

//-----------------------------------------------------------------------------------------------
//import du controlleur user.
const userCtrl = require("../controllers/user");

//route pour la création d'un nouvel utilisateur.
router.post("/signup", userCtrl.signup);

//route pour l'authentification d'un utilisateur.
router.post("/login", userCtrl.login);

//-----------------------------------------------------------------------------------------------
//export du routeur.
module.exports = router;
