//import du package mongoose.
const mongoose = require("mongoose");
//installation du package puis import du plugin uniqueValidator de mongoose...
//...permettant d'assurer que la même adresse mail ne puisse être enregistrée qu'une fois.
const uniqueValidator = require("mongoose-unique-validator");

//-----------------------------------------------------------------------------------------------
//création du schéma "user" conformément aux spécifications techniques demandées.
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//-----------------------------------------------------------------------------------------------
//avant d'exporter le modèle on applique le plugin uniqueValidator.
userSchema.plugin(uniqueValidator);

//-----------------------------------------------------------------------------------------------
//export du modèle user qui pourra intéragir avec la base de donnée.
module.exports = mongoose.model("User", userSchema);
