//import du framework express pour créer un routeur.
const express = require("express");
//création d'un routeur express.
const router = express.Router();

//-----------------------------------------------------------------------------------------------
//import du controlleur user.
const userCtrl = require("../controllers/user");
//import des middleware de contrôle des saisie d'email et de password.
const checkEmail = require("../middleware/check-email");
const checkPassword = require("../middleware/check-password");

//-----------------------------------------------------------------------------------------------
//enregistrement des routes de base sur le routeur ainsi que les middlewares qui y sont utilisés.

//route pour la création d'un nouvel utilisateur.
router.post("/signup", checkEmail, /*checkPassword,*/ userCtrl.signup);

//route pour l'authentification d'un utilisateur.
router.post("/login", userCtrl.login);

//-----------------------------------------------------------------------------------------------
//export du routeur.
module.exports = router;
