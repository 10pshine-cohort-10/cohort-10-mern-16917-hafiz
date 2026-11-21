import { Sequelize } from 'sequelize';
import env from './env';
import logger from './logger';

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: (msg: string) => logger.debug(msg),
  define: { underscored: true, timestamps: true },
});

export default sequelize;