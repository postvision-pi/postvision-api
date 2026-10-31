import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { getConfig } from './config/env.js';

async function start() {
    const config = getConfig();
    await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 10000 });
    console.log('Banco conectado com sucesso');

    const app = createApp(config);
    const server = await new Promise((resolve, reject) => {
        const listener = app.listen(config.port, '0.0.0.0', () => resolve(listener));
        listener.once('error', reject);
    });
    console.log(`Servidor rodando em http://localhost:${config.port}`);

    let stopping = false;
    const shutdown = async () => {
        if (stopping) return;
        stopping = true;
        const timeout = setTimeout(() => process.exit(1), 10000);
        timeout.unref();

        try {
            await new Promise((resolve, reject) => {
                server.close(err => err ? reject(err) : resolve());
            });
            await mongoose.disconnect();
        } catch (err) {
            console.error('Erro ao encerrar a API:', err.message);
            process.exitCode = 1;
        } finally {
            clearTimeout(timeout);
        }
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
}

start().catch(async err => {
    console.error('Erro ao iniciar a API:', err.message);
    await mongoose.disconnect();
    process.exitCode = 1;
});
