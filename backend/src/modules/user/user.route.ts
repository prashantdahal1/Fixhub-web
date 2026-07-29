import { UserController } from './user.controller.js';
import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { profileUpload } from '../../shared/middlewares/profileUpload.middleware.js';
import { UserService } from './user.service.js';
import { ApiResponseHelper } from '../../shared/utils/apihelper.util.js';
import { verifyGoogleIdToken } from '../../shared/utils/google.util.js';
import { documentUpload } from '../../shared/middlewares/documentUpload.middleware.js';

const userRouter = Router();
const userController = new UserController();
const userService = new UserService();

userRouter.post("/register", documentUpload.single('verificationDocument'), userController.createUser.bind(userController));
userRouter.post("/login", userController.loginUser.bind(userController));
userRouter.post("/upload", authMiddleware, profileUpload.single('avatar'), userController.updateProfile.bind(userController));
userRouter.post("/logout", (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: false });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});
userRouter.get("/whoami", authMiddleware, userController.whoami.bind(userController));
userRouter.put("/update", authMiddleware, profileUpload.single('avatar'), userController.updateProfile.bind(userController));
userRouter.put("/password", authMiddleware, userController.updatePassword.bind(userController));
userRouter.post(
  "/national-id",
  authMiddleware,
  documentUpload.fields([
    { name: 'nationalIdFront', maxCount: 1 },
    { name: 'nationalIdBack', maxCount: 1 }
  ]),
  userController.uploadNationalId.bind(userController)
);
userRouter.post(
  "/verification-document",
  authMiddleware,
  documentUpload.single('verificationDocument'),
  userController.uploadVerificationDocument.bind(userController)
);

export default userRouter;