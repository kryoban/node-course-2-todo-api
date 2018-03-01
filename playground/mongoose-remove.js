const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//     console.log(result);
// })

//Todo.findOneAndRemove({})
//Todo.findByIdAndRemove()

Todo.findByIdAndRemove('5a96e51de90a292658d7df60123').then((todo) => {
    console.log(todo);
}).catch((e) => {
    console.log('Invalid ID');
})