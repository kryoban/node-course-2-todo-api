var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

var Todo = mongoose.model('Todo', {
    text: {
        type: String
    },
    completed: {
        type: Boolean
    },
    completedAt: {
        type: Number
    }
});

var newTodo = new Todo({
    text: 'Cook dinner'
})

// newTodo.save().then((doc) => {
//     console.log('Saved todo', doc);
// }, (err) => {
//     console.log('Unable to save todo', err);
// })

var anotherTodo = new Todo({
    text: 'Eat dinner',
    completed: true,
    completedAt: 2018
})

anotherTodo.save().then((doc) => {
    console.log('Saved todo', JSON.stringify(anotherTodo, undefined, 2))
}, (err) => {
    console.log('Unable to save todo', err);
})
