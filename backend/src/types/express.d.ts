import type { IUser } from '../models/user.model.js';

declare global {
  namespace Express {
    // Augment passport's User interface so req.user carries IUser properties
    interface User extends IUser {}
    interface Request {
      user?: IUser;
    }
  }
}
