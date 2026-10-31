import { describe, expect, it } from 'vitest';
import User from '../models/Users.js';
import Exercice from '../models/Exercices.js';
import Session from '../models/Sessions.js';
import Notification from '../models/Notifications.js';
import { isValidCPF } from '../utils/cpfValidator.js';
import { getSeedConfig } from '../config/seed.js';
import { buildDemoData } from '../seed/demoData.js';

const env = { NODE_ENV: 'development', SEED_ENABLED: 'true', MONGODB_URI: 'mongodb://localhost:27017/postvision_demo' };

describe('configuração do seed', () => {
    it('aceita o banco de demonstração e a senha padrão', () => {
        expect(getSeedConfig(env)).toEqual({ mongodbUri: env.MONGODB_URI, password: 'PostVision123!' });
    });
    it('aceita senha personalizada', () => {
        expect(getSeedConfig({ ...env, SEED_PASSWORD: 'outra-senha' }).password).toBe('outra-senha');
    });
    it.each([
        [{ NODE_ENV: 'production' }, 'produção'],
        [{ SEED_ENABLED: 'false' }, 'SEED_ENABLED'],
        [{ MONGODB_URI: '' }, 'MONGODB_URI'],
        [{ MONGODB_URI: 'mongodb://localhost:27017/postvision' }, 'postvision_demo'],
        [{ MONGODB_URI: 'mongodb://localhost:27017/' }, 'postvision_demo'],
        [{ SEED_PASSWORD: 'curta' }, '8 caracteres']
    ])('recusa configuração incorreta: %j', (overrides, message) => {
        expect(() => getSeedConfig({ ...env, ...overrides })).toThrow(message);
    });
});

describe('dados de demonstração', () => {
    it('gera IDs estáveis mesmo em dias diferentes', () => {
        const first = buildDemoData(new Date(2026, 9, 29));
        const second = buildDemoData(new Date(2026, 10, 5));
        for (const group of Object.keys(first)) {
            expect(first[group].map(item => item._id)).toEqual(second[group].map(item => item._id));
            expect(new Set(first[group].map(item => item._id)).size).toBe(first[group].length);
        }
        expect(first.sessions[0].date).not.toEqual(second.sessions[0].date);
    });
    it('relaciona sessões e notificações aos exemplos existentes', () => {
        const data = buildDemoData();
        expect(data.users).toHaveLength(2);
        expect(data.exercises).toHaveLength(2);
        expect(data.sessions).toHaveLength(12);
        expect(data.notifications).toHaveLength(4);
        for (const session of data.sessions) {
            expect(data.users.some(user => user._id === session.userId)).toBe(true);
            expect(data.exercises.some(exercise => exercise._id === session.exerciseId)).toBe(true);
        }
        for (const notification of data.notifications) {
            expect(data.users.some(user => user._id === notification.userId)).toBe(true);
        }
        expect(data.users.every(user => isValidCPF(user.cpf))).toBe(true);
    });
    it('respeita os schemas reais sem conectar ao banco', async () => {
        const data = buildDemoData();
        for (const user of data.users) await new User({ ...user, password: 'hash-de-teste' }).validate();
        for (const exercise of data.exercises) await new Exercice(exercise).validate();
        for (const session of data.sessions) await new Session(session).validate();
        for (const notification of data.notifications) await new Notification(notification).validate();
    });
});
