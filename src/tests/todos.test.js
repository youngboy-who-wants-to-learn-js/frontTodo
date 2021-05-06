import moment from 'moment';
import sequelize from 'sequelize';
import request from 'supertest';
import { boot } from '../../server';
import { Todos } from '../models';
import generateAccessToken from '../utils/testUtils';

describe('/todos API test', () => {
  let client;
  let app;
  beforeAll(() => {
    app = boot();
    client = request(app);
  });

  describe('get all todos', () => {
    const accessToken = generateAccessToken(1, 94);

    test('get all todos', async (done) => {
      const todos = await Todos.findAll({ where: { UserId: 1 } });
      const response = await client
        .get('/todos')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(todos.length);
      done();
    });

    test('get all todos error test', async (done) => {
      const todos = await Todos.findAll({ where: { UserId: 1 } });
      const response = await client
        .get('/todos')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(todos.length);

      done();
    });

    test('get all todos for unauthorized user', async (done) => {
      const response = await client
        .get('/todos')
        .set('Authorization', `Bearer `);
      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ message: 'User is not logged in' });
      done();
    });

    test('get all completed todos', async (done) => {
      const todos = await Todos.findAll({
        where: { UserId: 1, completed: true },
      });
      const response = await client
        .get('/todos?filter=completed')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(todos.length);
      done();
    });

    test('get all todos period 7 days ', async (done) => {
      const todos = await Todos.findAll({
        where: {
          UserId: 1,
          createdAt: {
            [sequelize.Op.gte]: moment()
              .startOf('day')
              .subtract(7, 'days')
              .toDate(),
          },
        },
      });
      const response = await client
        .get('/todos?period=7')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(todos.length);
      done();
    });

    test('get all todos period 7 days ', async (done) => {
      const todos = await Todos.findAll({
        where: {
          UserId: 1,
          createdAt: {
            [sequelize.Op.gte]: moment()
              .startOf('day')
              .subtract(7, 'days')
              .toDate(),
          },
        },
      });
      const response = await client
        .get('/todos?period=7')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(todos.length);
      done();
    });

    test('get all todos from now to 2 days ago ', async (done) => {
      const todos = await Todos.findAll({
        where: {
          UserId: 1,
          createdAt: {
            [sequelize.Op.gte]: new Date(),
            [sequelize.Op.lte]: moment().subtract(2, 'days').toDate(),
          },
        },
      });
      const response = await client
        .get(
          `/todos?dateRangeFrom=${new Date()}&dateRangeTo=${moment()
            .subtract(2, 'days')
            .toDate()}`
        )
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(todos.length);
      done();
    });
  });

  describe('post new todos', () => {
    const accessToken = generateAccessToken(1, 52);

    test('post new todos', async (done) => {
      const response = await client
        .post('/todos')
        .send({ text: 'Todos post' })
        .set('Authorization', `Bearer ${accessToken}`);
      const todos = await Todos.findOne({
        where: { text: 'Todos post' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        text: todos.text,
        id: todos.id,
        completed: todos.completed,
        UserId: todos.UserId,
      });
      done();
    });

    test('post new todos for unauthorized user', async (done) => {
      const response = await client
        .post('/todos')
        .send({ text: 'Todos unauthorized' })
        .set('Authorization', `Bearer `);
      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ message: 'User is not logged in' });
      done();
    });

    test('post empty todos', async (done) => {
      const response = await client
        .post('/todos')
        .send({ text: '' })
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(401);
      done();
    });
  });

  describe('delete todo', () => {
    const accessToken = generateAccessToken(5, 94);

    test('delete todo', async (done) => {
      const response = await client
        .delete('/todos/15')
        .set('Authorization', `Bearer ${accessToken}`);
      const todo = await Todos.findOne({
        where: { id: 15, UserId: 5 },
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({ data: { id: '15' } });
      expect(todo).toBeNull();
      done();
    });

    test('delete todo for unauthorized user', async (done) => {
      const response = await client
        .delete('/todos/15')
        .send({ text: 'Todos unauthorized' })
        .set('Authorization', `Bearer `);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ message: 'User is not logged in' });
      done();
    });

    test('delete todo non-existent', async (done) => {
      const response = await client
        .delete(`/todos/${784654564}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(404);
      done();
    });
  });

  describe('update todo', () => {
    const accessToken = generateAccessToken(1, 94);

    test('update todo', async (done) => {
      const response = await client
        .patch('/todos/1')
        .send({ text: 'Todos updated', completed: true })
        .set('Authorization', `Bearer ${accessToken}`);

      const todo = await Todos.findOne({
        where: { id: 1, UserId: 1 },
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
      });
      done();
    });

    test('update todo with fake id', async (done) => {
      const response = await client
        .patch('/todos/8')
        .send({ text: 'Todos updated', completed: true })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({ message: 'Todo not found' });
      done();
    });

    test('update todo for unauthorized user', async (done) => {
      const response = await client
        .patch('/todos/1')
        .send({ text: 'Todos updated', completed: true })
        .set('Authorization', `Bearer `);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ message: 'User is not logged in' });
      done();
    });
  });

  describe('delete completed todos', () => {
    const accessToken = generateAccessToken(8, 52);

    test('delete completed todos', async (done) => {
      const response = await client
        .delete('/todos/deletecompleted')
        .set('Authorization', `Bearer ${accessToken}`)
        .send([16, 17]);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({ data: [16, 17] });
      done();
    });

    test('delete completed todos with empty arr of ids', async (done) => {
      const response = await client
        .delete('/todos/deletecompleted')
        .set('Authorization', `Bearer ${accessToken}`)
        .send([]);
      expect(response.statusCode).toBe(401);
      done();
    });

    test('delete completed for unauthorized user', async (done) => {
      const response = await client
        .delete('/todos/deletecompleted')
        .send([16, 17])
        .set('Authorization', `Bearer `);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ message: 'User is not logged in' });
      done();
    });

    test('delete completed todos with fake ids', async (done) => {
      const response = await client
        .delete('/todos/deletecompleted')
        .set('Authorization', `Bearer ${accessToken}`)
        .send([94654, 45694]);
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: 'There are no such todos',
      });
      done();
    });
  });

  describe('toggle all todos', () => {
    const accessToken = generateAccessToken(1, 94);

    test('toggle all todos', async (done) => {
      const response = await client
        .patch('/todos/toggleall')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ids: [1, 2], value: true });
      const todos = await Todos.findAll({
        where: { id: [1, 2], UserId: 1, completed: true },
      });
      expect(response.statusCode).toBe(200);
      expect(todos.length).toBe(2);
      done();
    });

    test('delete completed for unauthorized user', async (done) => {
      const response = await client
        .patch('/todos/toggleall')
        .set('Authorization', `Bearer `)
        .send({ ids: [1, 2], value: true });

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ message: 'User is not logged in' });
      done();
    });
  });
});
