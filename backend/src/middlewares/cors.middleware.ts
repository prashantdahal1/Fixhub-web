import { Request, Response, NextFunction } from 'express';
import { ALLOWED_ORIGINS } from '../configs/constant';

const isDev = process.env.NODE_ENV !== 'production';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;

  const isAllowed =
    origin &&
    (ALLOWED_ORIGINS.includes(origin) ||
      (isDev && /^http:\/\/localhost:\d+$/.test(origin)));

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin!);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};
