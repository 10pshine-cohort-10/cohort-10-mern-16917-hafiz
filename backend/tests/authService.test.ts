import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import authService from '../src/services/authService';
import userRepository from '../src/repositories/userRepository';
import User from '../src/models/User';

const fakeUser = (password = 'Password123'): Promise<User> =>
  bcrypt.hash(password, 4).then(
    (hash) =>
      ({
        id: 1,
        name: 'Hafiz',
        email: 'hafiz@example.com',
        password: hash,
        createdAt: new Date(),
      }) as unknown as User,
  );

const expectStatus = (promise: Promise<unknown>, status: number): Promise<void> =>
  promise.then(
    () => expect.fail('expected the call to be rejected'),
    (err: unknown) => {
      expect((err as { statusCode: number }).statusCode).to.equal(status);
    },
  );

describe('authService', () => {
  afterEach(() => sinon.restore());

  describe('signup', () => {
    it('creates a user and returns a token without the password', () =>
      fakeUser().then((user) => {
        sinon.stub(userRepository, 'findByEmail').resolves(null);
        sinon.stub(userRepository, 'create').resolves(user);
        return authService.signup('Hafiz', 'Hafiz@Example.com', 'Password123').then((result) => {
          expect(result.token).to.be.a('string');
          expect(result.user.email).to.equal('hafiz@example.com');
          expect(result.user).to.not.have.property('password');
        });
      }));

    it('rejects a duplicate email with 409', () =>
      fakeUser().then((user) => {
        sinon.stub(userRepository, 'findByEmail').resolves(user);
        return expectStatus(authService.signup('Hafiz', 'hafiz@example.com', 'Password123'), 409);
      }));
  });

  describe('login', () => {
    it('returns a token for correct credentials', () =>
      fakeUser().then((user) => {
        sinon.stub(userRepository, 'findByEmail').resolves(user);
        return authService.login('hafiz@example.com', 'Password123').then((result) => {
          expect(result.token).to.be.a('string');
        });
      }));

    it('rejects a wrong password with 401', () =>
      fakeUser().then((user) => {
        sinon.stub(userRepository, 'findByEmail').resolves(user);
        return expectStatus(authService.login('hafiz@example.com', 'WrongPass1'), 401);
      }));

    it('rejects an unknown email with 401', () => {
      sinon.stub(userRepository, 'findByEmail').resolves(null);
      return expectStatus(authService.login('nobody@example.com', 'Password123'), 401);
    });
  });

  describe('getProfile', () => {
    it('returns the safe user', () =>
      fakeUser().then((user) => {
        sinon.stub(userRepository, 'findById').resolves(user);
        return authService.getProfile(1).then((profile) => {
          expect(profile.name).to.equal('Hafiz');
          expect(profile).to.not.have.property('password');
        });
      }));

    it('throws 404 when the user does not exist', () => {
      sinon.stub(userRepository, 'findById').resolves(null);
      return expectStatus(authService.getProfile(99), 404);
    });
  });
});
