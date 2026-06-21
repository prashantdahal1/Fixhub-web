import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../configs/constant';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
