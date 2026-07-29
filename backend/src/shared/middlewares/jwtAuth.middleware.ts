import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../../config/constants.js';
import type { IUser } from '../../models/user.model.js';

export const jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('JWT Auth - Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('JWT Auth - No valid Bearer token found');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('JWT Auth - Token extracted:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('JWT Auth - Token is empty');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const payload = jwt.verify(token, SECRET_KEY);
    console.log('JWT Auth - Token verified successfully, user ID:', (payload as any)._id);
    req.user = payload as unknown as IUser;
    next();
  } catch (error) {
    console.log('JWT Auth - Token verification failed:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};
