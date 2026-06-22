import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PORT: number = Number(process.env.PORT) || 5000;
export const DUMMY: string = process.env.DUMMY || 'Dummy Export';
export const MONGODB_URL: string =
  process.env.MONGO_URI ||
  process.env.MONGODB_URL ||
  'mongodb://127.0.0.1:27017/fixhub';
export const SECRET_KEY: string =
  process.env.SECRET_KEY || 'merosecretkey';
export const ALLOWED_ORIGINS: string[] = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:58957',
  'http://localhost:8080',
  'https://fixhub.web.app',
  'http://192.168.1.9:5000',
];
export const UPLOAD_DIR: string = path.resolve(__dirname, '../../uploads');