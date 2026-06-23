import { UserController } from '../controllers/user.controller.js';
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { profileUpload } from '../middlewares/profileUpload.middleware.js';

const userRouter = Router();
const userController = new UserController();

userRouter.post(\"/register\", userController.createUser.bind(userController));
userRouter.post(\"/login\", userController.loginUser.bind(userController));
userRouter.post(\"/logout\", (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: false });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});
userRouter.get(\"/whoami\", authMiddleware, userController.whoami.bind(userController));
userRouter.put(\"/update\", authMiddleware, profileUpload.single('avatar'), userController.updateProfile.bind(userController));

export default userRouter;