import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRouter from './routes/userRoutes.js';
import exerciceRouter from './routes/exerciceRoutes.js';
import sessionRouter from './routes/sessionRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import { getHealth } from './controllers/healthController.js';

export function createApp({ frontendUrl = 'http://localhost:3000' } = {}) {
    const app = express();

    app.use(helmet());
    app.use(cors({ origin: frontendUrl, credentials: true }));
    app.use(express.json());
    app.get('/health', getHealth);
    app.use('/', userRouter);
    app.use('/', exerciceRouter);
    app.use('/', sessionRouter);
    app.use('/', notificationRouter);

    return app;
}
