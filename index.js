import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import userRouter from './routes/userRoutes.js';
import exerciceRouter from './routes/exerciceRoutes.js';
import sessionRouter from './routes/sessionRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Permite requisições do front-end (ajuste a origin em produção)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());

app.use('/', userRouter);
app.use('/', exerciceRouter);
app.use('/', sessionRouter);
app.use('/', notificationRouter);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Banco conectado com sucesso'))
    .catch((err) => console.error('Erro ao conectar no banco:', err));

const port = process.env.PORT || 4000;

app.listen(port, (err) => {
    if (err) {
        console.error('Erro ao iniciar o servidor: ', err);
    } else {
        console.log(`Servidor rodando em http://localhost:${port}`);
    }
});