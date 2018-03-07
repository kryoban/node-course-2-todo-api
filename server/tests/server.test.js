const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            })
    });

    it('should not create todo with invalid body data', (done) => {
        var text = '';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            })
    })
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            })
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        const id = todos[0]._id;

        request(app)
            .get(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(id).then((todo) => {
                    expect(todo._id).toEqual(id);
                    done();
                }).catch(err => done(err))
            });
    });

    it('should return 400 and invalid id message', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id + '123'}`)
            .expect(400)
            .expect((res) => {
                expect(res.body.error).toBe('Todo ID is invalid');
            })
            .end(done);
    })

    it('should return 404 and not found message', (done) => {
        request(app)
            .get(`/todos/${new ObjectID()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.error).toBe('Todo not found');
            })
            .end(done);
    })
});

describe('DELETE /todos/:id', () => {
    it('should delete a todo', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toEqual(todos[0]._id);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(todos[0]._id).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            }

            );
    });

    it('should return 400 and invalid todo id message', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id + '123'}`)
            .expect(400)
            .expect((res) => {
                expect(res.body.error).toBe('Todo ID is invalid')
            })
            .end(done);
    })

    it('should return 404 and todo not found message', (done) => {
        let id = new ObjectID();

        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.error).toBe('Todo not found')
            })
            .end(done);
    })
})

describe('PATCH /todos/:id', () => {
    it('should update a todo doc', (done) => {
        var body = { text: 'Updated todo', completed: true }
        request(app)
            .patch(`/todos/${todos[0]._id}`)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBeTruthy();
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findByIdAndUpdate(todos[0]._id, { $set: body }, { new: true }).then((todo) => {
                    expect(todo.text).toBe(body.text);
                    expect(todo.completed).toBeTruthy();
                    done();
                }).catch(err => done(err));
            })
    })

    it('should clear completedAt when todo is not completed', (done) => {
        var body = { completed: false }
        request(app)
            .patch(`/todos/${todos[1]._id}`)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(body.completed);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findByIdAndUpdate(todos[1]._id, { $set: body }, { new: true }).then((todo) => {
                    expect(todo.completed).toBeFalsy();
                    expect(todo.completedAt).toNotExist();
                    done();
                }).catch(e => done(e));
            })
    })
})

