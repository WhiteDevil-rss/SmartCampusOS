import bcrypt from 'bcrypt';
import type { Response } from 'express';
import prisma from '../lib/prisma';
import { logAction } from '../lib/logger';
import type { AuthRequest } from '../types/auth';
import {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  ROLE_COOKIE_NAME,
  clearAuthCookies,
  generateOpaqueToken,
  getRedirectUrlForRole,
  getCookieOptions,
  getReadableCookieOptions,
  hashToken,
  setLogoutReasonCookie,
  generateAccessToken,
  generateRefreshToken,
} from '../lib/security';
import { resetAuthRateLimit } from '../middlewares/security.middleware';

const PASSWORD_COMPLEXITY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const getSanitizedUser = (user: {
  id: string;
  username: string;
  email: string | null;
  role: string;
  entityId: string | null;
  universityId: string | null;
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  entityId: user.entityId,
  universityId: user.universityId,
});

const issueSession = async (req: AuthRequest, res: Response, user: any) => {
  const settings = await prisma.globalSettings.upsert({
    where: { id: 'system-config' },
    update: {},
    create: { id: 'system-config' },
  });

  const sessionId = generateOpaqueToken(24);
  const rawSessionToken = generateOpaqueToken();
  const rawCsrfToken = generateOpaqueToken(24);
  const maxAgeMs = settings.sessionTimeout * 60_000;
  const expiresAt = new Date(Date.now() + maxAgeMs);

  await prisma.userSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      sessionToken: hashToken(rawSessionToken),
      csrfToken: rawCsrfToken,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  res.cookie(AUTH_COOKIE_NAME, rawSessionToken, getCookieOptions(maxAgeMs));
  res.cookie(CSRF_COOKIE_NAME, rawCsrfToken, getReadableCookieOptions(maxAgeMs));
  res.cookie(ROLE_COOKIE_NAME, user.role, getReadableCookieOptions(maxAgeMs));

  return settings;
};

const registerFailedLogin = async (req: AuthRequest, email: string, reason: string) => {
  const settings = await prisma.globalSettings.upsert({
    where: { id: 'system-config' },
    update: {},
    create: { id: 'system-config' },
  });

  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const isLocked = failedLoginAttempts >= settings.loginAttemptLimit;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts,
        lockedUntil: isLocked
          ? new Date(Date.now() + settings.lockoutDurationMinutes * 60_000)
          : user.lockedUntil,
      },
    });
  }

  logAction({
    userId: user?.id,
    action: 'LOGIN_FAILED',
    entityType: 'AUTH',
    status: 'FAILURE',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    changes: { email, reason },
  });
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user || !user.passwordHash) {
      await registerFailedLogin(req, email, 'invalid-credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      await registerFailedLogin(req, email, 'account-deactivated');
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact an administrator.',
      });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await registerFailedLogin(req, email, 'account-locked');
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to repeated failed login attempts.',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      await registerFailedLogin(req, email, 'invalid-credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
        lastActivityAt: new Date(),
      },
    });

    const settings = await issueSession(req, res, user);
    resetAuthRateLimit(req);

    logAction({
      userId: user.id,
      action: 'USER_LOGIN_PASSWORD',
      entityType: 'AUTH',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: getSanitizedUser(user),
        redirectUrl: getRedirectUrlForRole(user.role),
        sessionTimeout: settings.sessionTimeout,
        warningMinutes: settings.sessionWarningMinutes,
        token: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to complete login.',
    });
  }
};

export const register = async (_req: AuthRequest, res: Response) => {
  return res.status(403).json({
    success: false,
    message: 'Public registration is disabled. Please contact an administrator.',
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      entityId: true,
      universityId: true,
    },
  });

  if (!user) {
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  const settings = await prisma.globalSettings.upsert({
    where: { id: 'system-config' },
    update: {},
    create: { id: 'system-config' },
  });

  return res.json({
    success: true,
    message: 'Authenticated session loaded.',
    data: {
      user: getSanitizedUser(user),
      redirectUrl: getRedirectUrlForRole(user.role),
      sessionTimeout: settings.sessionTimeout,
      warningMinutes: settings.sessionWarningMinutes,
      token: generateAccessToken(user as any),
      refreshToken: null,
    },
  });
};

export const getSessionSettings = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const settings = await prisma.globalSettings.upsert({
    where: { id: 'system-config' },
    update: {},
    create: { id: 'system-config' },
  });

  return res.json({ success: true, data: settings });
};

export const updateSessionSettings = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { sessionTimeout, sessionWarningMinutes, maxFailedAttempts, lockoutDuration } = req.body;

  const settings = await prisma.globalSettings.update({
    where: { id: 'system-config' },
    data: {
      sessionTimeout: sessionTimeout ? parseInt(sessionTimeout) : undefined,
      sessionWarningMinutes: sessionWarningMinutes ? parseInt(sessionWarningMinutes) : undefined,
      loginAttemptLimit: maxFailedAttempts ? parseInt(maxFailedAttempts) : undefined,
      lockoutDurationMinutes: lockoutDuration ? parseInt(lockoutDuration) : undefined,
    },
  });

  return res.json({ success: true, message: 'Security policies updated.', data: settings });
};

export const logout = async (req: AuthRequest, res: Response) => {
  if ((req as any).session?.id) {
    await prisma.userSession.updateMany({
      where: { id: (req as any).session.id, invalidatedAt: null },
      data: { invalidatedAt: new Date(), invalidatedReason: 'manual-logout' },
    });
  }

  clearAuthCookies(res);
  setLogoutReasonCookie(res, 'manual-logout');

  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const refreshSession = async (req: AuthRequest, res: Response) => {
  if (!req.user || !(req as any).session?.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  const settings = await prisma.globalSettings.findUnique({
    where: { id: 'system-config' },
  });

  const timeoutMinutes = settings?.sessionTimeout ?? 10;
  const maxAgeMs = timeoutMinutes * 60_000;

  await prisma.userSession.update({
    where: { id: (req as any).session.id },
    data: {
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + maxAgeMs),
    },
  });

  return res.json({
    success: true,
    timeoutMinutes,
    warningMinutes: settings?.sessionWarningMinutes ?? 2,
  });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  if (!PASSWORD_COMPLEXITY.test(newPassword ?? '')) {
    return res.status(400).json({
      success: false,
      message:
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
    });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user?.passwordHash) {
    return res.status(400).json({
      success: false,
      message: 'Password change is not available for this account.',
    });
  }

  const isValidPassword = await bcrypt.compare(currentPassword ?? '', user.passwordHash);
  if (!isValidPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect.',
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        sessionVersion: { increment: 1 },
      },
    }),
    prisma.userSession.updateMany({
      where: { userId: user.id, invalidatedAt: null },
      data: {
        invalidatedAt: new Date(),
        invalidatedReason: 'password-changed',
      },
    }),
  ]);

  clearAuthCookies(res);
  setLogoutReasonCookie(res, 'password-changed');

  return res.json({
    success: true,
    message: 'Password updated successfully. Please log in again.',
  });
};
