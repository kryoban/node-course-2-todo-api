// process.env.NODE_ENV este setat automat de Heroku atunci cand aplicatia este hostata
// sau este setat in package.json in scriptul de "test"
// daca rulam aplicatia local, setam automat mediul (process.env.NODE_ENV) ca fiind "development"
var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
    var config = require('./config.json')[env];
    
    Object.keys(config).forEach((key) => {
        process.env[key] = config[key];
    })
}