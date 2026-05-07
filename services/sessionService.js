import Session from '../models/Sessions.js';

class SessionService {
    async Create(userId, exerciseId, date, durationInSeconds, report, landmarksPath) {
        try {
            const newSession = new Session({
                userId,
                exerciseId,
                date,
                durationInSeconds,
                report,
                landmarksPath
            });
            return await newSession.save();
        } catch (err) {
            console.log('Erro ao criar sessão: ', err);
            throw new Error('Erro ao criar sessão');
        }
    }

    async GetAllByUserId(userId) {
        try {
            const sessions = await Session.find({ userId }).populate('exerciseId', 'name');
            return sessions;
        } catch (err) {
            console.log('Erro ao buscar sessões: ', err);
            throw new Error('Erro ao buscar sessões');
        }
    }



}


export default new SessionService();