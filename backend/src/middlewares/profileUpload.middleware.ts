import multer from 'multer';
import path from 'path';

// Directory: <projectRoot>/uploads/profile_pics (relative to backend root)
const PROFILE_PIC_DIR = path.resolve(__dirname, '../../uploads/profile_pics');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_PIC_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // `req.user` is attached by auth middleware; fallback to timestamp
    const userId = (req as any).user?.id ?? Date.now();
    cb(null, `${userId}${ext}`);
  },
});

const fileFilter = (_: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (['image/jpeg', 'image/png'].includes(file.mimetype)) cb(null, true);
  else cb(null, false);
};

export const profileUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
