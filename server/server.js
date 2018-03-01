var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var port = process.env.PORT || 3000;

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo')
var {User} = require('./models/user')

var app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send({message: 'Welcome!'})
})

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    })

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    })
})

app.get('/todos', (req, res) => {
    Todo.find().then((doc) => {
        res.send({todos: doc})
    }, (e) => {
        res.status(400).send(e);
    })
})

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send({error: 'Todo ID is invalid'});   
    }
    
    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send({error: 'Todo not found'});
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    })
})

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send({error: 'Todo ID is invalid'})
    } else {
        Todo.findByIdAndRemove(id).then((todo) => {
            if (!todo) {
                return res.status(404).send({error: 'Todo not found'})
            }
            return res.send(todo);
        }).catch((e) => {
            return res.status(400).send({error: e});
        })
    }
})

app.listen(port, () => {
    console.log(`Started on port ${port}`);
})

module.exports = {app};