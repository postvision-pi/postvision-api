export function normalizeDate(date) {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function calculateStreak(sessions) {
    const days = new Set(
        sessions.map(s => normalizeDate(s.date))
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (true) {
        const dateStr = normalizeDate(currentDate);

        if (days.has(dateStr)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
            currentDate.setHours(0, 0, 0, 0);
        } else {
            break;
        }
    }

    return streak;
}

export function getWeeklyData(sessions) {
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(today.getDate() - i);

        const dayStr = normalizeDate(day);

        const daySessions = sessions.filter(s =>
            normalizeDate(s.date) === dayStr
        );

        if (daySessions.length > 0) {
            const corretos = daySessions.reduce((acc, s) => acc + s.report.correctReps, 0);
            const total = daySessions.reduce(
                (acc, s) => acc + s.report.correctReps + s.report.incorrectReps,
                0
            );

            result.push({
                date: day.toISOString(),
                corretos,
                total
            });
        }
    }

    return result;
}

export function getMonthlyData(sessions) {
    const map = {};

    sessions.forEach(s => {
        const day = normalizeDate(s.date);

        if (!map[day]) {
            map[day] = 0;
        }

        map[day] += s.report.correctReps;
    });

    return Object.keys(map)
        .sort()
        .map(day => ({
            date: day,
            totalReps: map[day]
        }));
}

export function getLastSessionDate(sessions) {
    if (sessions.length === 0) return null;

    const lastSession = sessions.reduce((latest, session) => {
        return new Date(session.date).getTime() > new Date(latest.date).getTime()
            ? session
            : latest;
    });

    return {
        date: normalizeDate(lastSession.date),
        corretos: lastSession.report?.correctReps ?? 0,
        incorretos: lastSession.report?.incorrectReps ?? 0,
        total: (lastSession.report?.correctReps ?? 0) + (lastSession.report?.incorrectReps ?? 0),
        accuracy: lastSession.report
            ? Math.round(
                (lastSession.report.correctReps /
                    (lastSession.report.correctReps + lastSession.report.incorrectReps)) * 100
            )
            : 0
    };
}

export function getAverages(sessions) {
    if (!sessions || sessions.length === 0) {
        return {
            avgDuration: 0,
            avgAccuracy: 0
        };
    }

    let totalDuration = 0;
    let totalAccuracy = 0;

    sessions.forEach(session => {
        // duração
        totalDuration += session.durationInSeconds ?? 0;

        // accuracy da sessão
        const corretos = session.report?.correctReps ?? 0;
        const incorretos = session.report?.incorrectReps ?? 0;
        const total = corretos + incorretos;

        const accuracy = total > 0 ? (corretos / total) * 100 : 0;

        totalAccuracy += accuracy;
    });

    return {
        avgDuration: Math.round(totalDuration / sessions.length),
        avgAccuracy: Math.round(totalAccuracy / sessions.length)
    };
}