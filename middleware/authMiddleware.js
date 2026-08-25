import jwt from 'jsonwebtoken';
import dotenv from 'dotenv/config';

const secret = process.env.JWT_SECRET;

/**
 * Middleware que valida o Bearer token no header Authorization.
 * Adiciona `req.userId` com o id do usuário autenticado.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, secret);

        const userId = decoded.id_usuario?.toString() || decoded.id?.toString();

        if (!userId) {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }

        req.userId = userId;

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

export default authMiddleware;
