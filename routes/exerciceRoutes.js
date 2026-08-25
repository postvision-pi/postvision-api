import express from 'express';
import exerciceController from '../controllers/exerciceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
const exerciceRouter = express.Router();

// Criação/edição/exclusão de exercícios exige login (antes era 100% público,
// qualquer um podia criar/editar/apagar exercícios sem autenticação).
exerciceRouter.post('/exercice', authMiddleware, exerciceController.createExercice);

// Listagem continua pública: é um catálogo de exercícios, sem dado sensível.
exerciceRouter.get('/exercice', exerciceController.getAllExercices);

exerciceRouter.put('/exercice/:id', authMiddleware, exerciceController.updateExercice);

exerciceRouter.delete('/exercice/:id', authMiddleware, exerciceController.deleteExercice);

export default exerciceRouter;
