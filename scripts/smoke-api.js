import 'dotenv/config';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

const baseUrl = process.env.SMOKE_API_URL || 'http://localhost:4000';
const password = process.env.SEED_PASSWORD || 'PostVision123!';

async function request(path, { method = 'GET', body, token, expectedStatus = 200 } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(15000)
    });
    assert.equal(response.status, expectedStatus, `${method} ${path}: HTTP inesperado`);
    return response.json();
}

try {
    assert.deepEqual(await request('/health'), { status: 'ok', database: 'connected' });
    assert.equal((await request('/exercice')).length, 2);

    for (const [email, sessionCount] of [['demo@postvision.local', 8], ['bruno@postvision.local', 4]]) {
        const { token } = await request('/auth', { method: 'POST', body: { email, password } });
        assert.ok(token, 'O login deve retornar token');
        const { id_usuario: userId } = jwt.decode(token);
        assert.ok(userId);

        const sessions = await request(`/session/${userId}`, { token });
        assert.equal(sessions.length, sessionCount, 'O seed não deve duplicar sessões');
        assert.ok(sessions.every(session => session.exerciseId?.name), 'Os exercícios devem estar relacionados');

        const stats = await request(`/session/stats/${userId}`, { token });
        assert.ok(Number.isFinite(stats.avgAccuracy));
        assert.ok(Number.isFinite(stats.lastSession.accuracy));
        assert.ok(stats.monthly.length > 0);
        assert.equal((await request(`/notifications/${userId}`, { token })).length, 2);

        const otherId = userId === '67a000000000000000000001'
            ? '67a000000000000000000002' : '67a000000000000000000001';
        await request(`/session/${otherId}`, { token, expectedStatus: 403 });
        await request(`/session/${userId}`, { expectedStatus: 401 });
    }
    console.log('Conferência da demonstração passou: saúde, login, exercícios, sessões, estatísticas, notificações e permissões.');
} catch (err) {
    console.error('Falha ao conferir a demonstração:', err.message);
    process.exitCode = 1;
}
