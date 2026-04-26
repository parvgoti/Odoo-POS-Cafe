/**
 * Backend Mastery — Auth Module Example (2026)
 * ==============================================
 * Complete authentication flow with registration,
 * login, refresh tokens, password reset, and logout.
 */

import { z } from 'zod';
import { Router } from 'express';

// =============================================
// SCHEMAS
// =============================================

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z.string()
      .min(8, 'Minimum 8 characters')
      .max(128)
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[a-z]/, 'Must contain lowercase')
      .regex(/[0-9]/, 'Must contain number'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(1, 'Password required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
  }),
});


// =============================================
// SERVICE
// =============================================

export class AuthService {
  constructor({ prisma, hashPassword, verifyPassword, generateAccessToken, generateRefreshToken }) {
    this.prisma = prisma;
    this.hashPassword = hashPassword;
    this.verifyPassword = verifyPassword;
    this.generateAccessToken = generateAccessToken;
    this.generateRefreshToken = generateRefreshToken;
  }

  async register(data) {
    // Check existing
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already registered');

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Generate tokens
    const tokens = await this._generateTokens(user);

    return { user, ...tokens };
  }

  async login(email, password) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true, status: true, passwordHash: true },
    });

    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (user.status !== 'ACTIVE') throw new ForbiddenError('Account is suspended');

    // Verify password
    const valid = await this.verifyPassword(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const { passwordHash, ...userWithoutPassword } = user;
    const tokens = await this._generateTokens(userWithoutPassword);

    return { user: userWithoutPassword, ...tokens };
  }

  async refreshToken(refreshToken) {
    // Find session
    const session = await this.prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true, name: true, email: true, role: true, status: true } } },
    });

    if (!session) throw new UnauthorizedError('Invalid refresh token');
    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedError('Refresh token expired');
    }
    if (session.user.status !== 'ACTIVE') throw new ForbiddenError('Account is suspended');

    // Rotate refresh token (invalidate old, create new)
    await this.prisma.session.delete({ where: { id: session.id } });
    const tokens = await this._generateTokens(session.user);

    return { user: session.user, ...tokens };
  }

  async logout(refreshToken) {
    await this.prisma.session.deleteMany({ where: { token: refreshToken } });
  }

  async logoutAll(userId) {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async forgotPassword(email) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return success (don't reveal email existence)
    if (!user) return;

    const token = this.generateRefreshToken(); // reuse for simplicity
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordReset.create({
      data: { email, token, expiresAt },
    });

    // TODO: Send password reset email
    // await sendPasswordResetEmail(email, token);
  }

  async resetPassword(token, newPassword) {
    const reset = await this.prisma.passwordReset.findUnique({ where: { token } });

    if (!reset) throw new UnauthorizedError('Invalid reset token');
    if (reset.expiresAt < new Date()) throw new UnauthorizedError('Reset token expired');
    if (reset.usedAt) throw new UnauthorizedError('Reset token already used');

    const passwordHash = await this.hashPassword(newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email: reset.email },
        data: { passwordHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all sessions
      this.prisma.session.deleteMany({
        where: { user: { email: reset.email } },
      }),
    ]);
  }

  // ---- Private ----

  async _generateTokens(user) {
    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.prisma.session.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}


// =============================================
// CONTROLLER
// =============================================

export class AuthController {
  constructor(authService) {
    this.service = authService;
  }

  register = async (req, res) => {
    const result = await this.service.register(req.body);
    res.status(201).json({
      status: 'success',
      data: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  };

  login = async (req, res) => {
    const { email, password } = req.body;
    const result = await this.service.login(email, password);
    res.json({
      status: 'success',
      data: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  };

  refresh = async (req, res) => {
    const result = await this.service.refreshToken(req.body.refreshToken);
    res.json({
      status: 'success',
      data: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  };

  logout = async (req, res) => {
    await this.service.logout(req.body.refreshToken);
    res.status(204).send();
  };

  logoutAll = async (req, res) => {
    await this.service.logoutAll(req.user.id);
    res.status(204).send();
  };

  forgotPassword = async (req, res) => {
    await this.service.forgotPassword(req.body.email);
    res.json({
      status: 'success',
      message: 'If that email exists, a reset link has been sent.',
    });
  };

  resetPassword = async (req, res) => {
    await this.service.resetPassword(req.body.token, req.body.password);
    res.json({
      status: 'success',
      message: 'Password reset successful. Please log in.',
    });
  };

  me = async (req, res) => {
    res.json({ status: 'success', data: req.user });
  };
}


// =============================================
// ROUTES
// =============================================

export function createAuthRouter(controller) {
  const router = Router();

  router.post('/register',   /* validate(registerSchema), */       asyncHandler(controller.register));
  router.post('/login',      /* validate(loginSchema), */          asyncHandler(controller.login));
  router.post('/refresh',    /* validate(refreshTokenSchema), */   asyncHandler(controller.refresh));
  router.post('/logout',                                           asyncHandler(controller.logout));
  router.post('/logout-all', /* authenticate, */                   asyncHandler(controller.logoutAll));
  router.post('/forgot-password', /* validate(forgotPasswordSchema), */ asyncHandler(controller.forgotPassword));
  router.post('/reset-password',  /* validate(resetPasswordSchema), */  asyncHandler(controller.resetPassword));
  router.get('/me',          /* authenticate, */                   asyncHandler(controller.me));

  return router;
}


// ---- Helpers ----
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

class UnauthorizedError extends Error {
  constructor(msg) { super(msg); this.statusCode = 401; this.code = 'UNAUTHORIZED'; }
}
class ForbiddenError extends Error {
  constructor(msg) { super(msg); this.statusCode = 403; this.code = 'FORBIDDEN'; }
}
class ConflictError extends Error {
  constructor(msg) { super(msg); this.statusCode = 409; this.code = 'CONFLICT'; }
}

console.log('✅ Auth module example loaded — register, login, refresh, reset password, logout.');
