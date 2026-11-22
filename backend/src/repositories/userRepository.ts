import User from '../models/User';

const findByEmail = (email: string): Promise<User | null> => User.findOne({ where: { email } });

const findById = (id: number): Promise<User | null> => User.findByPk(id);

const create = (data: { name: string; email: string; password: string }): Promise<User> =>
  User.create(data);

const userRepository = { findByEmail, findById, create };

export default userRepository;
