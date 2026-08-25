import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
const userRouter = express.Router();

// Rota pública: usada apenas internamente hoje (o front do PostVision não
// chama isso), mas exige login mesmo assim já que devolve dados de usuário.
userRouter.get('/user/:email', authMiddleware, userController.getOne);

// Cadastro e login continuam públicos (é assim que o usuário entra no sistema)
userRouter.post('/user', userController.createUser);

userRouter.post('/auth', loginRateLimiter, userController.loginUser);

// Um usuário só pode alterar/apagar a própria conta (checagem dentro do controller)
userRouter.put('/user/:id', authMiddleware, userController.updateUser);

userRouter.delete('/user/:id', authMiddleware, userController.deleteUser);

userRouter.post(
    '/user/profile',
    authMiddleware,
    uploadMiddleware.single('file'),
    userController.uploadProfileImage
);

// Retorna a foto de perfil do usuário.
// A API busca a imagem no PostVision Files e repassa para o cliente.
// Mantida pública de propósito: é uma imagem de avatar, não um dado
// sensível, e hoje seria exibida via <img src="..."> (que não envia
// header Authorization). Se isso mudar, essa rota precisa de outra estratégia.
userRouter.get(
    '/user/profile/:id',
    userController.getProfileImage
);

export default userRouter;
