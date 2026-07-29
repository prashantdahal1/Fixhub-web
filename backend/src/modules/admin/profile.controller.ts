import { type Request, type Response } from 'express';
import { ApiResponseHelper } from '../../shared/utils/apihelper.util.js';
import { UserMongoRepository } from '../user/user.repository.js';

export class ProfileController {
  private userRepo = new UserMongoRepository();

  async uploadProfilePicture(req: Request, res: Response) {
    try {
      if (!req.file) {
        return ApiResponseHelper.error(res, 'No image file provided', 400);
      }
      const filePath = `/uploads/profile_pics/${req.file.filename}`;
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      if (!userId) {
        return ApiResponseHelper.error(res, 'User ID not found in session', 401);
      }
      await this.userRepo.update(userId.toString(), { profilePicture: filePath });
      return ApiResponseHelper.success(
        res,
        { profilePicture: filePath },
        'Profile picture updated',
      );
    } catch (err: any) {
      console.error('Profile upload error:', err);
      return ApiResponseHelper.error(
        res,
        err.message || 'Internal Server Error',
        err.status || 500,
      );
    }
  }
}
