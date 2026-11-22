import { Request, Response } from 'express';
import authService from '../services/authService';
import { AuthRequest, getUserId } from '../middlewares/authenticate';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  const result = await authService.signup(name, email, password);
  res.status(201).json({ success: true, message: 'Account created successfully', data: result });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ success: true, message: 'Logged in successfully', data: result });
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await authService.getProfile(getUserId(req));
  res.json({ success: true, data: { user } });
};
