const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        const id = todos[0]._id;

        request(app)
            .get(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findOne({ _id: id, _creator: users[0]._id }).then((todo) => {
                    expect(todo._id).toEqual(id);
                    done();
                }).catch(err => done(err))
            });
    });

    it('should not return todo doc created by other user', (done) => {
        const id = todos[1]._id;

        request(app)
            .get(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 400 and invalid id message', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id + '123'}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .expect((res) => {
                expect(res.body.error).toBe('Todo ID is invalid');
            })
            .end(done);
    })

    it('should return 404 and not found message', (done) => {
        request(app)
            .get(`/todos/${new ObjectID()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.error).toBe('Todo not found');
            })
            .end(done);
    })
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id}`)
            .set('x-auth', users[0].tokens[0].token)
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
            });
    });

    it('should not delete todo created by another user', (done) => {
        request(app)
            .delete(`/todos/${todos[1]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(todos[0]._id).then((todo) => {
                    expect(todo).toExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 400 and invalid todo id message', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id + '123'}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .expect((res) => {
                expect(res.body.error).toBe('Todo ID is invalid')
            })
            .end(done);
    });

    it('should return 404 and todo not found message', (done) => {
        let id = new ObjectID();

        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.error).toBe('Todo not found')
            })
            .end(done);
    });
})

describe('PATCH /todos/:id', () => {
    it('should update a todo doc', (done) => {
        var body = { text: 'Updated todo', completed: true }
        request(app)
            .patch(`/todos/${todos[0]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBeTruthy();
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done)
    })

    it('should not update todo doc created by other user', (done) => {
        var body = { text: 'Updated todo', completed: true }
        request(app)
            .patch(`/todos/${todos[0]._id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send(body)
            .expect(404)
            .end(done)
    })

    it('should clear completedAt when todo is not completed', (done) => {
        var body = { completed: false }
        request(app)
            .patch(`/todos/${todos[1]._id}`)
            .set('x-auth', users[1].tokens[0].token)
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

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    })

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    })
})

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com';
        var password = 'Test1234'

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist(); // syntax from course
                expect(res.get('x-auth')).toExist(); // seems to work just as fine
                expect(res.body._id).toExist();
                expect(res.body.email).toBe('example@example.com');
            })
            .end((err) => { // functie custom (optionala) care verifica si ca la nivelul bazei de date totul este in regula
                if (err) {
                    return done(err);
                }

                User.findOne({ email }).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((e) => {
                    done(e);
                })
            });
    });

    it('should return validation errors if request invalid', (done) => {
        var email = 'invalid';
        var password = '123';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .expect((res) => {
                expect(res.body.errors.email.message).toBe(`${email} is not a valid email`);
                expect(res.body.errors.password.kind).toBe('minlength');
            })
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        var email = users[0].email;
        var password = 'Test1234';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .expect((res) => {
                expect(res.body.code).toBe(11000); // error code generated by mongoose when the unique constraint is not satisfied
            })
            .end(done)
    });
});

describe('POST /users/login', () => {
    it('should authenticate a user and generate a token', (done) => {
        var email = users[1].email;
        var password = users[1].password;

        request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    })
                    done();
                }).catch((e) => {
                    return done(e);
                })
            });
    });

    it('should return 401 when credentials invalid', (done) => {
        var email = users[1].email;
        var password = users[1].password + '1';

        request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(401)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    // toBe(1) instead of 0 because the token he got at registration / 
                    // last login hasn't been replaced with a new one
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e) => {
                    return done(e);
                })
            });
    })
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        var user = users[0];
        var token = users[0].tokens[0].token;
        request(app)
            .delete('/users/me/token')
            .set('x-auth', token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => {
                    return done(e);
                })
            })
    })
})
