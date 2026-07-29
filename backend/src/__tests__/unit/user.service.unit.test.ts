import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { UserService } from '../../modules/user/user.service.js';
import { UserMongoRepository } from '../../modules/user/user.repository.js';
import { HttpException } from '../../shared/exceptions/http-exception.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('UserService Unit Tests', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    userService = new UserService();
  });

  describe('createUser()', () => {
    it('should throw HttpException(400) if email already exists', async () => {
      jest.spyOn(UserMongoRepository.prototype, 'getUserByEmail').mockResolvedValueOnce({ id: '1', email: 'test@example.com' } as any);

      await expect(
        userService.createUser({
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          username: 'johndoe',
          password: 'password123',
          role: 'customer',
        })
      ).rejects.toThrow(HttpException);
    });

    it('should throw HttpException(400) if username already exists', async () => {
      jest.spyOn(UserMongoRepository.prototype, 'getUserByEmail').mockResolvedValueOnce(null);
      jest.spyOn(UserMongoRepository.prototype, 'getUserByUsername').mockResolvedValueOnce({ id: '1', username: 'johndoe' } as any);

      await expect(
        userService.createUser({
          firstName: 'John',
          lastName: 'Doe',
          email: 'new@example.com',
          username: 'johndoe',
          password: 'password123',
          role: 'customer',
        })
      ).rejects.toThrow(HttpException);
    });

    it('should hash password and create user when email and username are unique', async () => {
      jest.spyOn(UserMongoRepository.prototype, 'getUserByEmail').mockResolvedValueOnce(null);
      jest.spyOn(UserMongoRepository.prototype, 'getUserByUsername').mockResolvedValueOnce(null);
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => 'hashed_password' as any);
      jest.spyOn(UserMongoRepository.prototype, 'createUser').mockResolvedValueOnce({
        _id: 'user123',
        email: 'new@example.com',
        username: 'johndoe',
      } as any);

      const result = await userService.createUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'new@example.com',
        username: 'johndoe',
        password: 'password123',
        role: 'customer',
      });

      expect(result).toHaveProperty('_id', 'user123');
    });
  });

  describe('loginUser()', () => {
    it('should throw error if email does not exist', async () => {
      jest.spyOn(UserMongoRepository.prototype, 'getUserByEmail').mockResolvedValueOnce(null);

      await expect(
        userService.loginUser({ email: 'nonexistent@example.com', password: 'password' })
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if password is wrong', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@example.com',
        password: 'hashed_password',
      };
      jest.spyOn(UserMongoRepository.prototype, 'getUserByEmail').mockResolvedValueOnce(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => false as any);

      await expect(
        userService.loginUser({ email: 'user@example.com', password: 'wrongpassword' })
      ).rejects.toThrow(HttpException);
    });

    it('should return user and token when credentials are valid', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@example.com',
        password: 'hashed_password',
        role: 'customer',
      };
      jest.spyOn(UserMongoRepository.prototype, 'getUserByEmail').mockResolvedValueOnce(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => true as any);
      jest.spyOn(jwt, 'sign').mockImplementationOnce(() => 'mock_jwt_token' as any);

      const response = await userService.loginUser({
        email: 'user@example.com',
        password: 'correctpassword',
      });

      expect(response).toEqual({ user: mockUser, token: 'mock_jwt_token' });
    });
  });
});
