import * as crypto from 'crypto';
import type { Response } from 'express';
import * as jwt from 'jsonwebtoken';

export const AUTH_COOKIE_NAME = 'scos_session';
export const CSRF_COOKIE_NAME = 'scos_csrf';
export const ROLE_COOKIE_NAME = 'scos_role';
export const LOGOUT_REASON_COOKIE = 'scos_logout_reason';

export const AUTH_REQUIRED_MESSAGE = 'Authentication required. Please log in.';
export const FORBIDDEN_MESSAGE = 'You do not have permission to access this resource.';

export const getRedirectUrlForRole = (role?: string | null) => {
  switch (role) {
    case 'SUPERADMIN':
      return '/superadmin';
    case 'UNI_ADMIN':
    case 'COLLEGE_ADMIN':
      return '/dashboard';
    case 'DEPT_ADMIN':
      return '/department';
    case 'FACULTY':
      return '/faculty-panel';
    case 'STUDENT':
    case 'PARENT':
      return '/student';
    case 'APPROVAL_ADMIN':
      return '/approval';
    default:
      return '/login';
  }
};

export const generateOpaqueToken = (size = 48) => crypto.randomBytes(size).toString('hex');

export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const getCookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: maxAgeMs,
});

export const getReadableCookieOptions = (maxAgeMs: number) => ({
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: maxAgeMs,
});

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
  res.clearCookie(CSRF_COOKIE_NAME, { path: '/' });
  res.clearCookie(ROLE_COOKIE_NAME, { path: '/' });
};

export const setLogoutReasonCookie = (res: Response, reason: string) => {
  res.cookie(
    LOGOUT_REASON_COOKIE,
    reason,
    getReadableCookieOptions(60_000),
  );
};

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-key';

export const generateAccessToken = (user: any) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
