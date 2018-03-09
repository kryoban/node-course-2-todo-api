var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
    // preluam tokenul "x-auth" din headerul requestului
    var token = req.header('x-auth');

    // cautam userul care contine token-ul in lista de tokens si il adaugam pe request
    // trimitem ca response un status 401 daca nu exista un user care sa aiba asociat tokenul
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token
        next();
    }).catch((e) => {
        res.status(401).send();
    });
}

module.exports = {authenticate};