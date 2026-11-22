import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env';
import logger from '../config/logger';
import AppError from '../utils/AppError';
import { handleServiceError } from '../utils/handleServiceError';
import userRepository from '../repositories/userRepository';
import User from '../models/User';

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthResult {
  user: SafeUser;
  token: string;
}

const SALT_ROUNDS = 10;

const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const signToken = (userId: number): string =>
  jwt.sign({ sub: String(userId) }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  });

const signup = async (name: string, email: string, password: string): Promise<AuthResult> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
    });

    logger.info({ userId: user.id }, 'User signed up');
    return { user: toSafeUser(user), token: signToken(user.id) };
  } catch (error) {
    return handleServiceError(error, 'auth.signup');
  }
};

const login = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const user = await userRepository.findByEmail(email.trim().toLowerCase());
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordMatches) {
      logger.warn('Failed login attempt');
      throw new AppError('Invalid email or password', 401);
    }

    logger.info({ userId: user.id }, 'User logged in');
    return { user: toSafeUser(user), token: signToken(user.id) };
  } catch (error) {
    return handleServiceError(error, 'auth.login');
  }
};

const getProfile = async (userId: number): Promise<SafeUser> => {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return toSafeUser(user);
  } catch (error) {
    return handleServiceError(error, 'auth.getProfile');
  }
};

const authService = { signup, login, getProfile };

export default authService;
