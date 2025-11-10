/**
 * Complete Authentication Controller
 * Implements all 15 auth endpoints as documented
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

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export class AuthController {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  private static readonly BCRYPT_ROUNDS = 12;

  /**
   * POST /api/auth/register
   * Complete user registration with validation
   */
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, password, firstName, lastName }: RegisterRequest = req.body;

      // Validate input
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

      // Create user
      const user = await prisma.users.create({
        data: {
          id: uuidv4(),
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password_hash: hashedPassword,
          first_name: firstName || null,
          last_name: lastName || null,
          elo: 1500,
          subscription_type: 'FREE',
          is_active: true,
          email_verified: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Store refresh token
      await prisma.user_sessions.create({
        data: {
          id: uuidv4(),
          user_id: user.id,
          refresh_token: refreshToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          created_at: new Date()
        }
      });

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600 // 1 hour
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * User login with JWT tokens
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

      if (!user || !user.is_active) {
        throw ErrorHandler.createOperationalError('Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw ErrorHandler.createOperationalError('Invalid credentials', 401);
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Store refresh token
      const expiresIn = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days or 7 days
      await prisma.user_sessions.create({
        data: {
          id: uuidv4(),
          user_id: user.id,
          refresh_token: refreshToken,
          expires_at: new Date(Date.now() + expiresIn),
          created_at: new Date()
        }
      });

      // Update last login
      await prisma.users.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      });

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;

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
   * Refresh access token
   */
  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw ErrorHandler.createOperationalError('Refresh token is required', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { userId: string };
      
      // Check if refresh token exists and is valid
      const session = await prisma.user_sessions.findFirst({
        where: {
          refresh_token: refreshToken,
          user_id: decoded.userId,
          expires_at: { gt: new Date() }
        }
      });

      if (!session) {
        throw ErrorHandler.createOperationalError('Invalid or expired refresh token', 401);
      }

      // Get user
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.is_active) {
        throw ErrorHandler.createOperationalError('User not found or inactive', 401);
      }

      // Generate new access token
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
   * Get user profile
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
            orderBy: { created_at: 'desc' },
            take: 10
          },
          games: {
            where: { OR: [{ player1_id: userId }, { player2_id: userId }] },
            orderBy: { updated_at: 'desc' },
            take: 10
          }
        }
      });

      if (!user) {
        throw ErrorHandler.createOperationalError('User not found', 404);
      }

      const { password_hash, ...userWithoutPassword } = user;

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
   * Update user profile
   */
  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { username, firstName, lastName, avatar_url } = req.body;

      if (!userId) {
        throw ErrorHandler.createOperationalError('Authentication required', 401);
      }

      // Check username uniqueness if provided
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
          ...(firstName !== undefined && { first_name: firstName }),
          ...(lastName !== undefined && { last_name: lastName }),
          ...(avatar_url !== undefined && { avatar_url }),
          updated_at: new Date()
        }
      });

      const { password_hash, ...userWithoutPassword } = updatedUser;

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
   * Logout user (revoke refresh token)
   */
  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Remove refresh token from database
        await prisma.user_sessions.deleteMany({
          where: { refresh_token: refreshToken }
        });
      }

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
   * Deactivate user account
   */
  public static async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw ErrorHandler.createOperationalError('Authentication required', 401);
      }

      // Deactivate user (soft delete)
      await prisma.users.update({
        where: { id: userId },
        data: {
          is_active: false,
          updated_at: new Date()
        }
      });

      // Remove all sessions
      await prisma.user_sessions.deleteMany({
        where: { user_id: userId }
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
   * Check if email is available
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
   * Check if username is available
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
   * Send password reset email
   */
  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email }: ForgotPasswordRequest = req.body;

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

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        this.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store reset token
      await prisma.password_resets.create({
        data: {
          id: uuidv4(),
          user_id: user.id,
          token: resetToken,
          expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          created_at: new Date()
        }
      });

      // TODO: Send email with reset link
      console.log(`Password reset link: https://your-app.com/reset-password?token=${resetToken}`);

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
   * Reset password with token
   */
  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword }: ResetPasswordRequest = req.body;

      if (!token || !newPassword) {
        throw ErrorHandler.createOperationalError('Token and new password are required', 400);
      }

      if (newPassword.length < 8) {
        throw ErrorHandler.createOperationalError('Password must be at least 8 characters', 400);
      }

      // Verify token
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string; type: string };

      if (decoded.type !== 'password_reset') {
        throw ErrorHandler.createOperationalError('Invalid token type', 400);
      }

      // Check if reset token exists and is valid
      const resetRecord = await prisma.password_resets.findFirst({
        where: {
          token: token,
          user_id: decoded.userId,
          expires_at: { gt: new Date() }
        }
      });

      if (!resetRecord) {
        throw ErrorHandler.createOperationalError('Invalid or expired reset token', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

      // Update user password
      await prisma.users.update({
        where: { id: decoded.userId },
        data: {
          password_hash: hashedPassword,
          updated_at: new Date()
        }
      });

      // Remove reset token
      await prisma.password_resets.delete({
        where: { id: resetRecord.id }
      });

      // Remove all user sessions
      await prisma.user_sessions.deleteMany({
        where: { user_id: decoded.userId }
      });

      res.json({
        success: true,
        message: 'Password reset successfully. Please login again.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify-email
   * Verify email address
   */
  public static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw ErrorHandler.createOperationalError('Verification token is required', 400);
      }

      // Verify token
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string; type: string };

      if (decoded.type !== 'email_verification') {
        throw ErrorHandler.createOperationalError('Invalid token type', 400);
      }

      // Update user email verification status
      await prisma.users.update({
        where: { id: decoded.userId },
        data: {
          email_verified: true,
          updated_at: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/sessions
   * Get all active sessions for user
   */
  public static async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw ErrorHandler.createOperationalError('Authentication required', 401);
      }

      const sessions = await prisma.user_sessions.findMany({
        where: {
          user_id: userId,
          expires_at: { gt: new Date() }
        },
        orderBy: { created_at: 'desc' }
      });

      res.json({
        success: true,
        sessions: sessions.map(session => ({
          id: session.id,
          created_at: session.created_at,
          expires_at: session.expires_at,
          is_current: session.refresh_token === req.body.refreshToken
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/auth/sessions/:id
   * Revoke a specific session
   */
  public static async revokeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        throw ErrorHandler.createOperationalError('Authentication required', 401);
      }

      const session = await prisma.user_sessions.findFirst({
        where: {
          id: id,
          user_id: userId
        }
      });

      if (!session) {
        throw ErrorHandler.createOperationalError('Session not found', 404);
      }

      await prisma.user_sessions.delete({
        where: { id: id }
      });

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
   * Change password for authenticated user
   */
  public static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword }: ChangePasswordRequest = req.body;

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
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw ErrorHandler.createOperationalError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

      // Update password
      await prisma.users.update({
        where: { id: userId },
        data: {
          password_hash: hashedPassword,
          updated_at: new Date()
        }
      });

      // Remove all sessions except current one
      const { refreshToken } = req.body;
      if (refreshToken) {
        await prisma.user_sessions.deleteMany({
          where: {
            user_id: userId,
            refresh_token: { not: refreshToken }
          }
        });
      }

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
