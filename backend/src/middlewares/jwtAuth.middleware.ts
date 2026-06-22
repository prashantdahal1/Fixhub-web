import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../configs/constant.js';

export const jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload as Record<string, any>;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
