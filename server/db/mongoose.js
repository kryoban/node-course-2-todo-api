var mongoose = require('mongoose');

// libraria de promise-uri folosita de mongoose este deprecated => ii alocam Promise-ul din obiectul global
mongoose.Promise = global.Promise;

// stabilirea conexiunii catre baza de date, process.env.MONGODB_URI fiind setat in ./../config/config.js
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};