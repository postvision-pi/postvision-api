// IDs estáveis permitem repetir o seed sem duplicar ou apagar registros.
export function buildDemoData(now = new Date()) {
    const users = [
        {
            _id: '67a000000000000000000001', firstName: 'Ana', lastName: 'Demonstração',
            email: 'demo@postvision.local', birthDate: '2000-01-15', cpf: '52998224725',
            gender: 'Feminino', phone: '11900000001'
        },
        {
            _id: '67a000000000000000000002', firstName: 'Bruno', lastName: 'Demonstração',
            email: 'bruno@postvision.local', birthDate: '1998-05-20', cpf: '11144477735',
            gender: 'Masculino', phone: '11900000002'
        }
    ];
    const exercises = [
        {
            _id: '67b000000000000000000001', name: 'Agachamento livre',
            description: 'Exercício de demonstração para membros inferiores.',
            videoUrl: '/demo/agachamento-livre.mp4', muscleGroup: 'Pernas'
        },
        {
            _id: '67b000000000000000000002', name: 'Agachamento com barra',
            description: 'Exercício de demonstração com análise de postura.',
            videoUrl: '/demo/agachamento-barra.mp4', muscleGroup: 'Pernas'
        }
    ];
    const daysAgo = [0, 1, 2, 4, 6, 9, 13, 20];
    const sessions = users.flatMap((user, userIndex) => {
        const days = userIndex === 0 ? daysAgo : daysAgo.slice(0, 4);
        return days.map((offset, index) => {
            const date = new Date(now);
            date.setDate(date.getDate() - offset);
            date.setHours(12, 0, 0, 0);
            const correctReps = 10 + index;
            const incorrectReps = index % 3;
            const id = `67c00000000000000000${String(userIndex * 8 + index + 1).padStart(4, '0')}`;

            return {
                _id: id, userId: user._id, exerciseId: exercises[index % exercises.length]._id,
                date, durationInSeconds: 180 + index * 15,
                report: {
                    correctReps, incorrectReps,
                    averageAccuracy: Math.round(correctReps / (correctReps + incorrectReps) * 100),
                    comment: { text: 'Dados de demonstração. Nenhuma análise real foi realizada.' }
                },
                landmarksPath: `/demo/landmarks/${id}.json`
            };
        });
    });
    const notifications = users.flatMap((user, index) => [
        {
            _id: `67d00000000000000000000${index * 2 + 1}`, userId: user._id,
            type: 'system', title: 'Bem-vindo ao PostVision!',
            message: 'Este perfil contém dados de demonstração.', read: false, createdAt: new Date(now)
        },
        {
            _id: `67d00000000000000000000${index * 2 + 2}`, userId: user._id,
            type: 'feedback', title: 'Treino de exemplo concluído',
            message: 'Confira as sessões e estatísticas do perfil.', read: true, createdAt: new Date(now)
        }
    ]);

    return { users, exercises, sessions, notifications };
}
