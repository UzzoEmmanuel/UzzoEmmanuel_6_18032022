//installation puis import du package password validator afin d'obtenir des utilisateurs des mots de passe un minimum sécurisés.
const passwordValidator = require("password-validator");

//création d'un schéma mongoose afin de définir les caractéristique du mot passe souhaité chez les utilisateurs.
const passwordSchema = new passwordValidator();

passwordSchema
  //doit contenir au minimum 8 caractères.
  .is()
  .min(8)
  //doit contenir au maximum 100 caractères.
  .is()
  .max(100)
  //doit contenir des majuscules.
  .has()
  .uppercase()
  //doit contenir des minuscules.
  .has()
  .lowercase()
  //doit contenir des nombres.
  .has()
  .digits()
  //ne doit pas contenir d'espaces.
  .has()
  .not()
  .spaces();

module.exports = passwordSchema;
