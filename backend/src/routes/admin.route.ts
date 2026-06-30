import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authorizedMiddleware, adminMiddleware } from '../middlewares/authorized.middleware.js';
import { profileUpload } from '../middlewares/profileUpload.middleware.js';

const adminRouter = Router();
const userController = new UserController();

adminRouter.use(authorizedMiddleware);
adminRouter.use(adminMiddleware);

adminRouter.get('/users', userController.getUsers.bind(userController));
adminRouter.get('/users/:id', userController.getUserById.bind(userController));
adminRouter.post('/users', profileUpload.single('profilePicture'), userController.adminCreateUser.bind(userController));
adminRouter.put('/users/:id', profileUpload.single('profilePicture'), userController.updateUser.bind(userController));
adminRouter.delete('/users/:id', userController.deleteUser.bind(userController));

export default adminRouter;
