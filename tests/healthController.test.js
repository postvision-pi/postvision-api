import { describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { getHealth } from '../controllers/healthController.js';

describe('saúde da API', () => {
    it.each([[1, 200, 'connected'], [0, 503, 'disconnected'], [2, 503, 'disconnected']])(
        'traduz estado do Mongoose %i em HTTP %i', (state, status, database) => {
            vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(state);
            const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
            getHealth({}, res);
            expect(res.status).toHaveBeenCalledWith(status);
            expect(res.json).toHaveBeenCalledWith({ status: status === 200 ? 'ok' : 'unavailable', database });
        }
    );
});
