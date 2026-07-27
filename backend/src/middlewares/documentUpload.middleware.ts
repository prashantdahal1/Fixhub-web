import multer from 'multer';
import path from 'path';

const DOC_DIR = path.resolve(process.cwd(), 'uploads/documents');

import fs from 'fs';

if (!fs.existsSync(DOC_DIR)) {
  fs.mkdirSync(DOC_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOC_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = (req as any).user?.id;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const prefix = userId ? `${userId}` : uniqueSuffix;
    cb(null, `${prefix}-${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype)) cb(null, true);
  else cb(null, false);
};

export const documentUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit for documents
});
