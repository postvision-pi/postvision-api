import rateLimit from 'express-rate-limit';

/**
 * Limita tentativas de login: 10 tentativas por IP a cada 15 minutos.
 * Ajuda a dificultar ataques de força bruta contra senhas.
 */
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

export default { loginRateLimiter };
