import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { profileUpload } from '../middlewares/profileUpload.middleware';

const router = Router();
const controller = new ProfileController();

router.put(
  '/upload',
  authMiddleware,
  profileUpload.single('avatar'),
  controller.uploadProfilePicture.bind(controller),
);

export const profileRouter = router;
