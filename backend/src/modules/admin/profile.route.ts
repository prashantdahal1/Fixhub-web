import { Router } from 'express';
import { ProfileController } from './profile.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { profileUpload } from '../../shared/middlewares/profileUpload.middleware.js';

const router = Router();
const controller = new ProfileController();

router.put(
  '/upload',
  authMiddleware,
  profileUpload.single('avatar'),
  controller.uploadProfilePicture.bind(controller),
);

export const profileRouter = router;
