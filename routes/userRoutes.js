import express from 'express';
import userController from '../controllers/userController.js';
const userRouter = express.Router();

userRouter.get('/user/:email', userController.getOne);

userRouter.post('/user', userController.createUser);

userRouter.post('/auth', userController.loginUser);

userRouter.put('/user/:id', userController.updateUser);

userRouter.delete('/user/:id', userController.deleteUser);

export default userRouter;