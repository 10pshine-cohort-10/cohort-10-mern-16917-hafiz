import app from './app';
import sequelize from './config/database';
import './models';
import logger from './config/logger';
import env from './config/env';

const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');

    await sequelize.sync();
    logger.info('Database synced');

    const server = app.listen(env.port, (error?: Error) => {
      if (error) {
        logger.fatal({ err: error }, 'Failed to bind server port');
        void sequelize.close().finally(() => process.exit(1));
        return;
      }
      logger.info(`Server running on http://localhost:${env.port}`);
    });

    const shutdown = (signal: string): void => {
      logger.info(`${signal} received, shutting down gracefully`);
      server.close(async () => {
        try {
          await sequelize.close();
          process.exit(0);
        } catch (error) {
          logger.error({ err: error }, 'Failed to close database connection');
          process.exit(1);
        }
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  process.exit(1);
});

void start();
