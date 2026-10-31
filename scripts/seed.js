import 'dotenv/config';
import mongoose from 'mongoose';
import { getSeedConfig } from '../config/seed.js';
import { populateDemo } from '../seed/populate.js';

try {
    const { mongodbUri, password } = getSeedConfig();
    await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: 10000 });
    const result = await populateDemo(password);
    console.log('Seed concluído:', JSON.stringify(result, null, 2));
    console.log('Contas de demonstração: demo@postvision.local e bruno@postvision.local');
} catch (err) {
    console.error('Erro ao executar seed:', err.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
