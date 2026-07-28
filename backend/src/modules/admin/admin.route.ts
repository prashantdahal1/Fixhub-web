import { Router } from 'express';
import { UserController } from '../user/user.controller.js';
import { authorizedMiddleware, adminMiddleware } from '../../shared/middlewares/authorized.middleware.js';
import { profileUpload } from '../../shared/middlewares/profileUpload.middleware.js';
import { documentUpload } from '../../shared/middlewares/documentUpload.middleware.js';
import adminController from './admin.controller.js';

const adminRouter = Router();
const userController = new UserController();

adminRouter.use(authorizedMiddleware);
adminRouter.use(adminMiddleware);

adminRouter.get('/users', userController.getUsers.bind(userController));
adminRouter.get('/users/:id', userController.getUserById.bind(userController));
adminRouter.post('/users', profileUpload.single('avatar'), userController.adminCreateUser.bind(userController));
adminRouter.put('/users/:id', profileUpload.single('avatar'), userController.updateUser.bind(userController));
adminRouter.patch('/users/:id', profileUpload.single('avatar'), userController.updateUser.bind(userController));
adminRouter.delete('/users/:id', userController.deleteUser.bind(userController));

adminRouter.get('/unverified-pros', userController.getUnverifiedPros.bind(userController));
adminRouter.patch('/verify-pro/:id', userController.verifyPro.bind(userController));

// Suggest service details from a provided image (heuristic/AI placeholder)
adminRouter.post('/service-suggest', documentUpload.single('image'), adminController.suggestServiceFromImage.bind(adminController));

export default adminRouter;
