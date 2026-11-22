import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import env from '../src/config/env';

const token = jwt.sign({ sub: '1' }, env.jwt.secret, { expiresIn: '1h' });
const auth = { Authorization: `Bearer ${token}` };

describe('Auth routes', () => {
  it('POST /api/auth/signup returns 400 for invalid input', () =>
    request(app)
      .post('/api/auth/signup')
      .send({ name: 'H', email: 'not-an-email', password: '123' })
      .then((res) => {
        expect(res.status).to.equal(400);
        expect(res.body.success).to.equal(false);
        expect(res.body.details).to.be.an('array');
      }));

  it('POST /api/auth/login returns 400 when the body is missing', () =>
    request(app)
      .post('/api/auth/login')
      .then((res) => {
        expect(res.status).to.equal(400);
      }));

  it('GET /api/auth/me returns 401 without a token', () =>
    request(app)
      .get('/api/auth/me')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));

  it('GET /api/auth/me returns 401 for an invalid token', () =>
    request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer abc.def.ghi')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));
});

describe('Notes routes', () => {
  it('requires authentication', () =>
    request(app)
      .get('/api/notes')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));

  it('POST /api/notes rejects an invalid colour', () =>
    request(app)
      .post('/api/notes')
      .set(auth)
      .send({ title: 'x', color: 'neon' })
      .then((res) => {
        expect(res.status).to.equal(400);
        expect(res.body.details).to.be.an('array');
      }));

  it('POST /api/notes/import returns 400 when the body is missing', () =>
    request(app)
      .post('/api/notes/import')
      .set(auth)
      .then((res) => {
        expect(res.status).to.equal(400);
      }));

  it('PUT /api/notes/:id rejects an empty body', () =>
    request(app)
      .put('/api/notes/1')
      .set(auth)
      .send({})
      .then((res) => {
        expect(res.status).to.equal(400);
      }));

  it('GET /api/notes/abc rejects a non-numeric id', () =>
    request(app)
      .get('/api/notes/abc')
      .set(auth)
      .then((res) => {
        expect(res.status).to.equal(400);
      }));

  it('POST /api/notes/import rejects an empty list', () =>
    request(app)
      .post('/api/notes/import')
      .set(auth)
      .send({ notes: [] })
      .then((res) => {
        expect(res.status).to.equal(400);
      }));
});
