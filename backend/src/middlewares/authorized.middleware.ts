import type { Request, Response, NextFunction } from 'express';
import { SECRET_KEY } from '../configs/constant.js';
import jwt from 'jsonwebtoken';
import type { IUser } from '../models/user.model.js';
import { UserMongoRepository } from '../repositories/user.repository.js';
import { HttpException } from '../exceptions/http-exception.js';
import { ApiResponseHelper } from '../utils/apihelper.util.js';

// adding tag (user) to request, can use req.user
let userRepository = new UserMongoRepository();
export const authorizedMiddleware =
    async (req: Request, res: Response, next: NextFunction) => {
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

            if (!token) {
                throw new HttpException(401, 'Unauthorized JWT missing');
            }

            const decodedToken = jwt.verify(token, SECRET_KEY) as Record<string, any>;
            if (!decodedToken || !decodedToken.id) {
                throw new HttpException(401, 'Unauthorized JWT unverified');
            } // make function async
            const user = await userRepository.getUserById(decodedToken.id);
            if (!user) throw new HttpException(401, 'Unauthorized user not found');
            req.user = user; // attach user to request (like tag)
            return next();
        } catch (err: Error | any) {
            return ApiResponseHelper.error(
                res,
                err.message || 'Internal Server Error',
                err.status || 500
            );
        }
    }

export const adminMiddleware = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpException(401, 'Unauthorized no user info');
        }
        if (req.user.role !== 'admin') {
            throw new HttpException(403, 'Forbidden not admin');
        }
        return next();
    } catch (err: Error | any) {
        return ApiResponseHelper.error(
            res,
            err.message || 'Internal Server Error',
            err.status || 500
        );
    }
}