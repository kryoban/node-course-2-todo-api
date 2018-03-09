// process.env.NODE_ENV este setat automat de Heroku atunci cand aplicatia este hostata
// sau este setat in package.json in scriptul de "test"
// daca rulam aplicatia local, setam automat mediul (process.env.NODE_ENV) ca fiind "development"
var env = process.env.NODE_ENV || 'development';
console.log('env ******', env);

// o data stabilit environmentul setam portul pe care va rula serverul express si calea catre baza de date
if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}