import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import logger from './config/logger';
import env from './config/env';
import notFound from './middlewares/notFound';
import errorHandler from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';
import authRoutes from './routes/authRoutes';
import noteRoutes from './routes/noteRoutes';

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '2mb' }));
app.use('/api', apiLimiter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Notes API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
