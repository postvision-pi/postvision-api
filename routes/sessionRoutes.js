import sessionController from '../controllers/sessionController.js';

import express from 'express';
const sessionRouter = express.Router();

sessionRouter.post('/session/', sessionController.CreateSession);

sessionRouter.get('/session/:userId', sessionController.GetSessionsByUserId);

sessionRouter.get('/session/stats/:userId', sessionController.GetStats);


export default sessionRouter;