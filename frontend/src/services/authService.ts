import api from './api';
import type { AuthResult, User } from '../types';

const login = async (email: string, password: string): Promise<AuthResult> => {
  const { data } = await api.post<{ data: AuthResult }>('/auth/login', { email, password });
  return data.data;
};

const signup = async (name: string, email: string, password: string): Promise<AuthResult> => {
  const { data } = await api.post<{ data: AuthResult }>('/auth/signup', { name, email, password });
  return data.data;
};

const me = async (): Promise<User> => {
  const { data } = await api.get<{ data: { user: User } }>('/auth/me');
  return data.data.user;
};

const authService = { login, signup, me };

export default authService;
