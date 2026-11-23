import { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import authService from '../services/authService';
import { AuthRequest, getUserId } from '../middlewares/authenticate';

interface SignupBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const signup = async (
  req: Request<ParamsDictionary, unknown, SignupBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.signup(name, email, password);
    res.status(201).json({ success: true, message: 'Account created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<ParamsDictionary, unknown, LoginBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, message: 'Logged in successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getProfile(getUserId(req));
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
