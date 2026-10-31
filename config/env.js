export function getConfig(env = process.env) {
    const mongodbUri = env.MONGODB_URI?.trim();
    const jwtSecret = env.JWT_SECRET?.trim();
    const port = Number(env.PORT || 4000);

    if (!mongodbUri) throw new Error('Defina MONGODB_URI no ambiente ou no .env.');
    if (!jwtSecret) throw new Error('Defina JWT_SECRET no ambiente ou no .env.');
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
    }

    return {
        mongodbUri,
        port,
        frontendUrl: env.FRONTEND_URL || 'http://localhost:3000'
    };
}
