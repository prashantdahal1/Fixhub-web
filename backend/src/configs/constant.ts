import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

function requireEnv(name: string, fallback?: string): string {
  const value = (process.env[name] || fallback)?.toString().trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See backend/.env.example`
    );
  }
  if (isProduction && fallback && value === fallback) {
    throw new Error(
      `Refusing to start: ${name} must be set explicitly in production`
    );
  }
  return value;
}

export const PORT: number = Number(process.env.PORT) || 5000;
export const DUMMY: string = process.env.DUMMY || 'Dummy Export';
export const NODE_ENV: string = process.env.NODE_ENV || 'development';

export const MONGODB_URL: string = requireEnv(
  'MONGO_URI',
  process.env.MONGODB_URL || (isProduction ? undefined : 'mongodb://127.0.0.1:27017/fixhub')
);

export const SECRET_KEY: string = requireEnv(
  'SECRET_KEY',
  isProduction ? undefined : 'dev-only-secret-change-me'
);

export const SESSION_SECRET: string = requireEnv(
  'SESSION_SECRET',
  process.env.SECRET_KEY || (isProduction ? undefined : 'dev-only-session-secret')
);

export const ALLOWED_ORIGINS: string[] = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:58957',
  'http://localhost:8080',
  'https://fixhub.web.app',
  'http://192.168.1.9:5000',
  'http://192.168.1.11:5000',
  'http://192.168.1.11:3000',
  // Flutter mobile apps don't send Origin headers, but kept for completeness
];
export const UPLOAD_DIR: string = path.resolve(__dirname, '../../uploads');

export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET || '';
