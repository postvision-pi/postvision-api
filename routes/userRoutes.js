import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
const userRouter = express.Router();

userRouter.get('/user/:email', userController.getOne);

userRouter.post('/user', userController.createUser);

userRouter.post('/auth', userController.loginUser);

userRouter.put('/user/:id', userController.updateUser);

userRouter.delete('/user/:id', userController.deleteUser);

userRouter.post(
    '/user/profile',
    authMiddleware,
    uploadMiddleware.single('file'),
    userController.uploadProfileImage
);

// Retorna a foto de perfil do usuário.
// A API busca a imagem no PostVision Files e repassa para o cliente.
userRouter.get(
    '/user/profile/:id',
    userController.getProfileImage
);

export default userRouter;
