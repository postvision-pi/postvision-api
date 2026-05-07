import express from 'express';
import exerciceController from '../controllers/exerciceController.js';
const exerciceRouter = express.Router();

exerciceRouter.post('/exercice', exerciceController.createExercice);

exerciceRouter.get('/exercice', exerciceController.getAllExercices);

exerciceRouter.put('/exercice/:id', exerciceController.updateExercice);

exerciceRouter.delete('/exercice/:id', exerciceController.deleteExercice);

export default exerciceRouter;