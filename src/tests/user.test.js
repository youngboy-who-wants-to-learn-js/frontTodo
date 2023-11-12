import request from 'supertest';
import { boot } from '../../server';
import { USER_ROLE_ADMIN, USER_ROLE_USER } from '../enums/role';
import { USER_STATUS_ACTIVE, USER_STATUS_INACTIVE } from '../enums/status';
import { Users } from '../models';
import generateAccessToken from '../utils/testUtils';

describe('/users API test', () => {
  let client;
  let app;
  beforeAll(() => {
    app = boot();
    client = request(app);
  });
  const accessToken = generateAccessToken(4, 94);
  const tokenRoleUser = generateAccessToken(2, 52);

  describe('get users', () => {
    test('return users list', async (done) => {
      const users = await Users.findAll({});
      const response = await client
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(users.length - 1);
      expect(Array.isArray(response.body.data)).toBeTruthy();
      done();
    });

    test('return an error for a simple user', async (done) => {
      const response = await client
        .get('/users')
        .set('Authorization', `Bearer ${tokenRoleUser}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({ message: 'You have no rights' });
      done();
    });

    test('return error for unauthorized user', async (done) => {
      const response = await client
        .get('/users')
        .set('Authorization', `Bearer`);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ message: 'User is not logged in' });
      done();
    });
  });

  describe('assign-role for user', () => {
    test('return updated admin user role', async (done) => {
      const response = await client
        .patch(`/users/assign-role/${USER_ROLE_ADMIN}/${3}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toMatchObject({ id: 3, role: 94 });
      done();
    });
    test('return updated user user role', async (done) => {
      const response = await client
        .patch(`/users/assign-role/${USER_ROLE_USER}/${5}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.data).toMatchObject({ id: 5, role: 52 });
      done();
    });

    test('update user role for non-existent user', async (done) => {
      const response = await client
        .patch(`/users/assign-role/${USER_ROLE_USER}/${5656}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: 'No such user exists',
      });
      done();
    });

    test('update with non-existent role return error', async () => {
      const response = await client
        .patch(`/users/assign-role/${505}/${5}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: 'Such a role does not exist',
      });
    });
    test('return an error for a simple user', async (done) => {
      const response = await client
        .patch(`/users/assign-role/${USER_ROLE_USER}/${5}`)
        .set('Authorization', `Bearer ${tokenRoleUser}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({ message: 'You have no rights' });
      done();
    });

    test('return error for unauthorized user', async (done) => {
      const response = await client
        .patch(`/users/assign-role/${USER_ROLE_USER}/${3}`)
        .set('Authorization', `Bearer`);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ message: 'User is not logged in' });
      done();
    });
  });

  describe('set-status for user', () => {
    test('return updated inactive status', async (done) => {
      const response = await client
        .patch(`/users/set-status/${USER_STATUS_INACTIVE}/${6}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toMatchObject({ id: 6, status: 2 });
      done();
    });
    test('return updated active status', async (done) => {
      const response = await client
        .patch(`/users/set-status/${USER_STATUS_ACTIVE}/${7}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.data).toMatchObject({ id: 7, status: 1 });
      done();
    });

    test('update with non-existent status return error', async () => {
      const response = await client
        .patch(`/users/set-status/${599}/${5}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: 'Such a status does not exist',
      });
    });
    test('return an error for a simple user', async (done) => {
      const response = await client
        .patch(`/users/set-status/${USER_STATUS_INACTIVE}/${6}`)
        .set('Authorization', `Bearer ${tokenRoleUser}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({ message: 'You have no rights' });
      done();
    });

    test('return error for unauthorized user', async (done) => {
      const response = await client
        .patch(`/users/set-status/${USER_STATUS_INACTIVE}/${6}`)
        .set('Authorization', `Bearer`);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ message: 'User is not logged in' });
      done();
    });

    test('update user status for non-existent user', async (done) => {
      const response = await client
        .patch(`/users/set-status/${USER_STATUS_INACTIVE}/${5656}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: 'No such user exists',
      });
      done();
    });
  });
});
