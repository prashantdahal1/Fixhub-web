import type { IUser } from '../models/user.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any> | IUser | undefined;
    }
  }
}
