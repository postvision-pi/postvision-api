import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    normalizeDate, calculateStreak, getWeeklyData,
    getMonthlyData, getLastSessionDate, getAverages
} from '../utils/statsUtils.js';

// Datas locais ao meio-dia: os testes não dependem do fuso da máquina.
function session(day, correctReps = 8, incorrectReps = 2, durationInSeconds = 60) {
    return { date: new Date(2026, 9, day, 12), durationInSeconds, report: { correctReps, incorrectReps } };
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 29, 18));
});
afterEach(() => vi.useRealTimers());

describe('datas e streak', () => {
    it('normaliza a data no calendário local', () => {
        expect(normalizeDate(new Date(2026, 0, 2, 12))).toBe('2026-01-02');
    });
    it('retorna zero sem sessões', () => expect(calculateStreak([])).toBe(0));
    it('conta dias consecutivos sem duplicar sessões do mesmo dia', () => {
        expect(calculateStreak([session(28), session(29), session(29), session(27), session(25)])).toBe(3);
    });
    it('mantém a regra atual: o streak começa por hoje', () => {
        expect(calculateStreak([session(28), session(27)])).toBe(0);
    });
    it('atravessa a virada do mês', () => {
        vi.setSystemTime(new Date(2026, 10, 1, 12));
        expect(calculateStreak([session(31), { date: new Date(2026, 10, 1, 12) }])).toBe(2);
    });
});

describe('agregações', () => {
    it('soma sessões de um dia e limita a semana aos últimos sete dias', () => {
        const result = getWeeklyData([session(22), session(23, 5, 1), session(29, 8, 2), session(29, 3, 1), session(30)]);
        expect(result.map(item => ({ ...item, date: normalizeDate(item.date) }))).toEqual([
            { date: '2026-10-23', corretos: 5, total: 6 },
            { date: '2026-10-29', corretos: 11, total: 14 }
        ]);
    });
    it('não inventa dias de treino quando não existem sessões', () => {
        expect(getWeeklyData([])).toEqual([]);
        expect(getMonthlyData([])).toEqual([]);
    });
    it('agrupa as repetições corretas por dia e ordena as datas', () => {
        expect(getMonthlyData([session(29, 8), session(25, 3), session(29, 5)])).toEqual([
            { date: '2026-10-25', totalReps: 3 },
            { date: '2026-10-29', totalReps: 13 }
        ]);
    });
    it('calcula médias por sessão, sem ponderar pelo número de repetições', () => {
        expect(getAverages([session(28, 10, 0, 120), session(29, 1, 1, 61)])).toEqual({ avgDuration: 91, avgAccuracy: 75 });
    });
    it('retorna médias zeradas sem dados ou sem repetições', () => {
        expect(getAverages([])).toEqual({ avgDuration: 0, avgAccuracy: 0 });
        expect(getAverages(undefined)).toEqual({ avgDuration: 0, avgAccuracy: 0 });
        expect(getAverages([{ date: new Date() }])).toEqual({ avgDuration: 0, avgAccuracy: 0 });
    });
});

describe('última sessão', () => {
    it('retorna null sem sessões', () => expect(getLastSessionDate([])).toBeNull());
    it('encontra a mais recente mesmo fora de ordem', () => {
        expect(getLastSessionDate([session(29, 2, 1), session(25)])).toEqual({
            date: '2026-10-29', corretos: 2, incorretos: 1, total: 3, accuracy: 67
        });
    });
    it('retorna zero em vez de NaN quando não houve repetições', () => {
        const result = getLastSessionDate([session(29, 0, 0)]);
        expect(result.total).toBe(0);
        expect(result.accuracy).toBe(0);
        expect(JSON.parse(JSON.stringify(result)).accuracy).toBe(0);
    });
    it('aceita relatório ausente ou parcial', () => {
        expect(getLastSessionDate([{ date: new Date() }]).accuracy).toBe(0);
        expect(getLastSessionDate([{ date: new Date(), report: { correctReps: 4 } }]).accuracy).toBe(100);
    });
});
