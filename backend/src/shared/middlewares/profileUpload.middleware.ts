import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory: <backendRoot>/uploads/profile_pics
// process.cwd() = backend/ when running 'npm run dev' from backend/
const PROFILE_PIC_DIR = path.resolve(process.cwd(), 'uploads/profile_pics');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_PIC_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // `req.user` is attached by auth middleware; fallback to timestamp + random number
    if ((req as any).user?.id) {
      cb(null, `${(req as any).user.id}${ext}`);
    } else {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${ext}`);
    }
  },
});

const fileFilter = (_: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
  else cb(null, false);
};

export const profileUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
