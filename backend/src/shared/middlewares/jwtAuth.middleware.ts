import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../../config/constants.js';
import type { IUser } from '../../models/user.model.js';

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
    req.user = payload as unknown as IUser;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
