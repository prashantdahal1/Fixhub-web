import type { Request, Response, NextFunction } from 'express';
import { SECRET_KEY } from '../../config/constants.js';
import jwt from 'jsonwebtoken';
import { UserMongoRepository } from '../../modules/user/user.repository.js';

const userRepository = new UserMongoRepository();

export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1] || '';
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (token) {
      const decodedToken = jwt.verify(token, SECRET_KEY) as Record<string, any>;
      if (decodedToken && decodedToken.id) {
        const user = await userRepository.getUserById(decodedToken.id);
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (_) {
    // Ignore invalid/expired token errors in optional middleware
  }
  return next();
};
