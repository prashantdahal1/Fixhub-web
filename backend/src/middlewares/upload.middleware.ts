import multer from 'multer';
import path from 'path';
import { type Request } from 'express';
import { UPLOAD_DIR } from '../configs/constant.js';
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(UPLOAD_DIR, 'avatars')),
  filename: (req: Request & { user?: any }, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = req.user?.id ? `${req.user.id}${ext}` : `${Date.now()}${ext}`;
    cb(null, name);
  }
});
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (['image/jpeg', 'image/png'].includes(file.mimetype)) cb(null, true);
  else cb(null, false);
};
export const uploadMiddleware = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
