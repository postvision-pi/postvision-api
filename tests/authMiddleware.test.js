import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/authMiddleware.js';

const secret = 'segredo-usado-somente-nos-testes-unitarios';

function authenticate(header) {
    const req = { headers: { authorization: header } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();
    authMiddleware(req, res, next);
    return { req, res, next };
}

beforeEach(() => vi.stubEnv('JWT_SECRET', secret));

describe('authMiddleware', () => {
    it.each([undefined, '', 'Basic abc', 'Bearer '])('rejeita header sem token: %s', header => {
        const { res, next } = authenticate(header);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
    it.each([
        'token-invalido',
        jwt.sign({ id_usuario: '123' }, 'outro-segredo'),
        jwt.sign({ id_usuario: '123', exp: 1 }, secret),
        jwt.sign({ email: 'demo@example.test' }, secret)
    ])('rejeita assinatura, expiração ou identidade inválida', token => {
        const { res, next } = authenticate(`Bearer ${token}`);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
    it.each([{ id_usuario: '123' }, { id: '123' }])('preenche userId para tokens aceitos: %j', payload => {
        const { req, res, next } = authenticate(`Bearer ${jwt.sign(payload, secret, { expiresIn: '1h' })}`);
        expect(req.userId).toBe('123');
        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });
});
