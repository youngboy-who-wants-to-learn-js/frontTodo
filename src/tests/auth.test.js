import request from 'supertest';
import { boot } from '../../server';
import mockUserTokens from '../utils/seedHelper';
import generateAccessToken from '../utils/testUtils';

describe('/auth API test', () => {
  let client;
  let app;
  beforeAll(() => {
    app = boot();
    client = request(app);
  });

  describe('login test', () => {
    test('should return a login user', async (done) => {
      const response = await client
        .post('/auth/login')
        .send({ userName: 'gav', password: '12345678' });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.userName).toBe('gav');
      done();
    });
    test('login non-existent user return error', async (done) => {
      const response = await client
        .post('/auth/login')
        .send({ userName: 'dfjs', password: '12345678' });
      expect(response.statusCode).toBe(400);
      done();
    });

    test('login user w/ invalid password return valid error', async (done) => {
      const response = await client
        .post('/auth/login')
        .send({ userName: 'gav', password: '123456' });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({ message: 'Incorrect password' });
      done();
    });

    test('login blocked user', async (done) => {
      const response = await client
        .post('/auth/login')
        .send({ userName: 'user77', password: '12345678' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({ message: 'User is blocked' });
      done();
    });
  });

  describe('registration test', () => {
    test('should returt a confirmation of registration', async (done) => {
      const response = await client.post('/auth/register').send({
        email: '98798787',
        password: '12345678',
        userName: 'gav22',
        age: 298985,
        phone: '+380509955666',
        address: 'IdiNaBazy 25',
      });
      expect(response.statusCode).toBe(200);
      done();
    });
  });

  describe('refresh token test', () => {
    test('should update refresh token', async (done) => {
      const accessToken = generateAccessToken(2, 52);

      const response = await client
        .post('/auth/refresh-tokens')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken: mockUserTokens.user2 });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          userName: 'user44',
          id: 2,
          email: 'user44@gmail.com',
          role: 52,
        },
      });
      done();
    });
    test('without refreshToken in body should return error', async (done) => {
      const accessToken = generateAccessToken(2, 52);

      const response = await client
        .post('/auth/refresh-tokens')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({ message: 'Empty token' });
      done();
    });

    test('refreshToken should return user is blocked', async (done) => {
      const accessToken = generateAccessToken(3, 52);

      const response = await client
        .post('/auth/refresh-tokens')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken: mockUserTokens.user3 });
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({ message: 'User is blocked' });
      done();
    });
  });
});
