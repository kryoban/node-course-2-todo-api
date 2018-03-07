const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

var password = '123abc!';
// bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(password, salt, (err, hash) => {
//         console.log(hash);
//     })
// });

var hashedPassword = '$2a$10$m2mvsjiHX1fzTzd7fwDAnuY78ZGrBJwG3BnkK5thMQYQW.HK/Spm6';

bcrypt.compare(password, hashedPassword, (err, success) => {
    console.log(success);
})

// var data = {
//     id: 10
// }

// var token = jwt.sign(data, '123abc');
// console.log(token);

// var decoded = jwt.verify(token, '123abc');
// console.log('decoded', decoded);

// var message = 'I am user number 3';
// var hash = SHA256(message).toString();

// console.log(message);
// console.log(hash);

// var data = {
//     id: 4
// }

// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }

// // salting a hash = sa ii adaug un string generat aleator unui hash, astfel incat sa previn generarea unui token din afara serverului
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if (resultHash === token.hash) {
//     console.log('Data was not changed.');
// } else {
//     console.log('Data was changed, do not trust.')
// }