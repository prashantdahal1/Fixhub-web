import { type Request, type Response, type NextFunction } from 'express';
import { ALLOWED_ORIGINS } from '../configs/constant.js';

const isDev = process.env.NODE_ENV !== 'production';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;

  // Mobile apps (Flutter, React Native) don't send an Origin header.
  // Allow all non-browser clients (no origin) unconditionally.
  if (!origin) {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    return next();
  }

  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    (isDev && /^http:\/\/localhost:\d+$/.test(origin)) ||
    (isDev && /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin));

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};
