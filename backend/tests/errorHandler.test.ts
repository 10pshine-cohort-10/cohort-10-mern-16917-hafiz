import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import app from '../src/app';
import logger from '../src/config/logger';

describe('errorHandler logging', () => {
  afterEach(() => sinon.restore());

  it('never writes the rejected request body to the logs', () => {
    const warn = sinon.spy(logger, 'warn');
    return request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"password":"hunter2-secret",')
      .then((res) => {
        expect(res.status).to.equal(400);
        expect(warn.called).to.equal(true);
        expect(JSON.stringify(warn.args)).to.not.contain('hunter2-secret');
      });
  });
});
