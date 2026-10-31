export function getSeedConfig(env = process.env) {
    if (env.NODE_ENV === 'production') {
        throw new Error('O seed de demonstração não pode rodar em produção.');
    }
    if (env.SEED_ENABLED !== 'true') {
        throw new Error('Defina SEED_ENABLED=true para habilitar o seed de demonstração.');
    }

    const mongodbUri = env.MONGODB_URI?.trim();
    let database;
    try {
        database = new URL(mongodbUri).pathname.slice(1);
    } catch {
        throw new Error('Defina uma MONGODB_URI válida para o seed.');
    }
    if (database !== 'postvision_demo') {
        throw new Error('O seed só pode popular o banco postvision_demo. Ajuste MONGODB_URI.');
    }

    const password = env.SEED_PASSWORD || 'PostVision123!';
    if (password.length < 8) throw new Error('SEED_PASSWORD deve ter pelo menos 8 caracteres.');

    return { mongodbUri, password };
}
