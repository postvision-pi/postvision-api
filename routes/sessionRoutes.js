import sessionController from '../controllers/sessionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

import express from 'express';
const sessionRouter = express.Router();

// ATENÇÃO: o postvision-web não chama esta rota hoje (nenhuma tela cria
// sessão diretamente). Se algum outro serviço (ex: app de câmera/análise
// de postura) cria sessões chamando esta rota sem um login de usuário,
// esta exigência de token vai quebrar essa integração — avise para
// trocarmos por uma chave de API interna nesse caso.
sessionRouter.post('/session/', authMiddleware, sessionController.CreateSession);

sessionRouter.get('/session/:userId', authMiddleware, sessionController.GetSessionsByUserId);

sessionRouter.get('/session/stats/:userId', authMiddleware, sessionController.GetStats);


export default sessionRouter;
