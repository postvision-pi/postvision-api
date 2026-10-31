import { describe, expect, it } from 'vitest';
import { getConfig } from '../config/env.js';

const env = { MONGODB_URI: 'mongodb://localhost:27017/postvision_test', JWT_SECRET: 'teste' };

describe('configuração da API', () => {
    it('usa os padrões de porta e frontend', () => {
        expect(getConfig(env)).toEqual({ mongodbUri: env.MONGODB_URI, port: 4000, frontendUrl: 'http://localhost:3000' });
    });
    it('aceita configurações explícitas', () => {
        expect(getConfig({ ...env, PORT: '4500', FRONTEND_URL: 'http://localhost:3100' })).toMatchObject({ port: 4500, frontendUrl: 'http://localhost:3100' });
    });
    it.each(['MONGODB_URI', 'JWT_SECRET'])('exige %s', field => {
        expect(() => getConfig({ ...env, [field]: ' ' })).toThrow(field);
    });
    it.each(['abc', '0', '-1', '65536', '4000.5'])('rejeita porta inválida: %s', PORT => {
        expect(() => getConfig({ ...env, PORT })).toThrow('PORT');
    });
});
