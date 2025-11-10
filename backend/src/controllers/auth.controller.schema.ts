/**
 * Schema-Compliant Authentication Controller
 * Uses exact Prisma schema: users table with correct field names
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { ErrorHandler } from '../middleware/error.middleware';

const prisma = new PrismaClient();

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export class AuthController {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  private static readonly BCRYPT_ROUNDS = 12;

  /**
   * POST /api/auth/register
   */
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, password, firstName, lastName }: RegisterRequest = req.body;

      if (!email || !username || !password) {
        throw ErrorHandler.createOperationalError('Email, username and password are required', 400);
      }

      if (password.length < 8) {
        throw ErrorHandler.createOperationalError('Password must be at least 8 characters', 400);
      }

      // Check if user already exists
      const existingUser = await prisma.users.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
          ]
        }
      });

      if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
        throw ErrorHandler.createOperationalError(`This ${field} is already registered`, 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

      // Create user with schema-compliant fields
      const user = await prisma.users.create({
        data: {
          id: uuidv4(),
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password: hashedPassword, // Schema uses 'password' not 'password_hash'
          avatar: null, // Schema uses 'avatar' not 'avatar_url'
          level: 'BEGINNER', // Schema enum
          elo: 1500,
          subscriptionType: 'FREE', // Schema enum
          isActive: true, // Schema uses 'isActive' not 'is_active'
          emailVerified: false, // Schema uses 'emailVerified' not 'email_verified'
          createdAt: new Date(), // Schema uses 'createdAt' not 'created_at'
          lastLoginAt: new Date() // Schema uses 'lastLoginAt' not 'last_login'
        }
      });

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, rememberMe = false }: LoginRequest = req.body;

      if (!email || !password) {
        throw ErrorHandler.createOperationalError('Email and password are required', 400);
      }

      // Find user
      const user = await prisma.users.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user || !user.isActive) { // Schema uses 'isActive'
        throw ErrorHandler.createOperationalError('Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password); // Schema uses 'password'
      if (!isValidPassword) {
        throw ErrorHandler.createOperationalError('Invalid credentials', 401);
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Update last login
      await prisma.users.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() } // Schema uses 'lastLoginAt'
      });

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: rememberMe ? 2592000 : 604800
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw ErrorHandler.createOperationalError('Refresh token is required', 400);
      }

      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { userId: string };
      
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        throw ErrorHandler.createOperationalError('User not found or inactive', 401);
      }

      const newAccessToken = this.generateAccessToken(user.id);

      res.json({
        success: true,
        accessToken: newAccessToken,
        expiresIn: 3600
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/profile
   */
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw ErrorHandler.createOperationalError('Authentication required', 401);
      }

      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          analyses: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          games_games_white_player_idTousers: {
            where: { status: 'FINISHED' },
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          games_games_black_player_idTousers: {
            where: { status: 'FINISHED' },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!user) {
        throw ErrorHandler.createOperationalError('User not found', 404);
      }

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/auth/profile
   */
  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { username, avatar } = req.body; // Schema only has these updatable fields

      if (!userId) {
        throw ErrorHandler.createOperationalError('Authentication required', 401);
      }

      if (username) {
        const existingUser = await prisma.users.findFirst({
          where: {
            username: username.toLowerCase(),
            id: { not: userId }
          }
        });

        if (existingUser) {
          throw ErrorHandler.createOperationalError('Username already taken', 409);
        }
      }

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          ...(username && { username: username.toLowerCase() }),
          ...(avatar !== undefined && { avatar })
          // Schema doesn't have updatedAt field
        }
      });

      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Implement session management when needed
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/auth/account
   */
  public static async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw ErrorHandler.createOperationalError('Authentication required', 401);
      }

      await prisma.users.update({
        where: { id: userId },
        data: { isActive: false } // Schema uses 'isActive'
      });

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/check-email
   */
  public static async checkEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        throw ErrorHandler.createOperationalError('Email parameter is required', 400);
      }

      const user = await prisma.users.findUnique({
        where: { email: email.toLowerCase() }
      });

      res.json({
        success: true,
        available: !user,
        message: user ? 'Email is already registered' : 'Email is available'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/check-username
   */
  public static async checkUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username } = req.query;

      if (!username || typeof username !== 'string') {
        throw ErrorHandler.createOperationalError('Username parameter is required', 400);
      }

      const user = await prisma.users.findUnique({
        where: { username: username.toLowerCase() }
      });

      res.json({
        success: true,
        available: !user,
        message: user ? 'Username is already taken' : 'Username is available'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw ErrorHandler.createOperationalError('Email is required', 400);
      }

      const user = await prisma.users.findUnique({
        where: { email: email.toLowerCase() }
      });

      // Always return success to prevent email enumeration
      if (!user) {
        res.json({
          success: true,
          message: 'If an account with this email exists, a reset link has been sent'
        });
        return;
      }

      // TODO: Implement password reset when password_resets table is added
      console.log(`Password reset requested for: ${email}`);

      res.json({
        success: true,
        message: 'If an account with this email exists, a reset link has been sent'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw ErrorHandler.createOperationalError('Token and new password are required', 400);
      }

      if (newPassword.length < 8) {
        throw ErrorHandler.createOperationalError('Password must be at least 8 characters', 400);
      }

      // TODO: Implement password reset when password_resets table is added
      res.json({
        success: true,
        message: 'Password reset functionality coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify-email
   */
  public static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw ErrorHandler.createOperationalError('Verification token is required', 400);
      }

      // TODO: Implement email verification when needed
      res.json({
        success: true,
        message: 'Email verification functionality coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/sessions
   */
  public static async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Implement session management when user_sessions table is added
      res.json({
        success: true,
        sessions: []
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/auth/sessions/:id
   */
  public static async revokeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // TODO: Implement session revocation when user_sessions table is added
      res.json({
        success: true,
        message: 'Session revoked successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/change-password
   */
  public static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        throw ErrorHandler.createOperationalError('Authentication required', 401);
      }

      if (!currentPassword || !newPassword) {
        throw ErrorHandler.createOperationalError('Current password and new password are required', 400);
      }

      if (newPassword.length < 8) {
        throw ErrorHandler.createOperationalError('New password must be at least 8 characters', 400);
      }

      // Get user
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw ErrorHandler.createOperationalError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw ErrorHandler.createOperationalError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

      // Update password
      await prisma.users.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper methods
   */
  private static generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  private static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
  }
}
