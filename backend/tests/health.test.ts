import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app';

describe('Health and error handling', () => {
  it('GET /api/health responds with success', () =>
    request(app)
      .get('/api/health')
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
      }));

  it('unknown route returns a JSON 404', () =>
    request(app)
      .get('/api/nope')
      .then((res) => {
        expect(res.status).to.equal(404);
        expect(res.body.success).to.equal(false);
        expect(res.body.message).to.contain('Route not found');
      }));

  it('malformed JSON returns a 400', () =>
    request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{bad json')
      .then((res) => {
        expect(res.status).to.equal(400);
      }));
});