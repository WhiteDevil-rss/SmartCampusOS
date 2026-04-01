import type { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { firebaseAdmin } from '../lib/firebase-admin';
import { UserRole, RoleHierarchy } from '@smartcampus-os/types';
import type { AuthRequest } from '../types/auth';
import {
  AUTH_COOKIE_NAME,
  AUTH_REQUIRED_MESSAGE,
  FORBIDDEN_MESSAGE,
  LOGOUT_REASON_COOKIE,
  clearAuthCookies,
  hashToken,
  setLogoutReasonCookie,
} from '../lib/security';
import { isPublicApiRoute } from './security.middleware';

export type { AuthRequest } from '../types/auth';

const parseCookies = (req: Request) =>
  Object.fromEntries(
    (req.headers.cookie ?? '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf('=');
        return [
          decodeURIComponent(part.slice(0, separatorIndex)),
          decodeURIComponent(part.slice(separatorIndex + 1)),
        ];
      }),
  );

const getFirebaseToken = (authHeader: string | undefined) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const parts = authHeader.split(' ');
  return parts.length === 2 ? parts[1] : null;
};

const unauthorized = (res: Response) =>
  res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });

const forbidden = (res: Response) =>
  res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' });

const buildAuthUser = (user: any) => ({
  id: user.id,
  role: user.role as UserRole,
  entityId: user.entityId,
  universityId: user.universityId,
  email: user.email ?? undefined,
  username: user.username,
});

const invalidateSessionAndReject = async (
  res: Response,
  sessionId: string | undefined,
  reason: string,
) => {
  if (sessionId) {
    await prisma.userSession.updateMany({
      where: { id: sessionId, invalidatedAt: null },
      data: { invalidatedAt: new Date(), invalidatedReason: reason },
    });
  }

  clearAuthCookies(res);
  setLogoutReasonCookie(res, reason);

  return unauthorized(res);
};

const authenticateWithSession = async (req: AuthRequest, res: Response) => {
  const cookies = parseCookies(req);
  const sessionToken = cookies[AUTH_COOKIE_NAME];
  if (!sessionToken) return false;

  const hashedSessionToken = hashToken(sessionToken);
  const session = await prisma.userSession.findUnique({
    where: { sessionToken: hashedSessionToken },
    include: { user: true },
  });

  if (!session || !session.user) {
    return invalidateSessionAndReject(res, undefined, 'invalid-session');
  }

  const now = new Date();
  const settings = await prisma.globalSettings.upsert({
    where: { id: 'system-config' },
    update: {},
    create: { id: 'system-config' },
  });

  const inactivityDeadline = new Date(
    session.lastActivityAt.getTime() + settings.sessionTimeout * 60_000,
  );

  if (
    session.invalidatedAt ||
    session.expiresAt <= now ||
    inactivityDeadline <= now ||
    !session.user.isActive ||
    (session.user.lockedUntil && session.user.lockedUntil > now) ||
    (session.user.sessionVersion > 0 &&
      session.createdAt < session.user.passwordChangedAt)
  ) {
    const reason = !session.user.isActive 
      ? 'account-deactivated' 
      : (session.user.lockedUntil && session.user.lockedUntil > now) 
        ? 'account-locked' 
        : 'session-expired';
    return invalidateSessionAndReject(res, session.id, reason);
  }

  await prisma.userSession.update({
    where: { id: session.id },
    data: { lastActivityAt: now },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastActivityAt: now },
  });

  req.user = buildAuthUser(session.user);
  (req as any).session = session;
  return true;
};

const authenticateWithFirebase = async (req: AuthRequest, res: Response) => {
  const token = getFirebaseToken(req.headers.authorization);
  if (!token) return false;

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid: uid }, { email: email ?? undefined }],
      },
    });

    if (!user || !user.isActive) {
      return unauthorized(res);
    }

    if (!user.firebaseUid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: uid },
      });
    }

    req.user = buildAuthUser(user);
    (req as any).firebaseUser = { uid, email };
    return true;
  } catch (error) {
    return unauthorized(res);
  }
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user) {
    return next();
  }

  const sessionAuthenticated = await authenticateWithSession(req, res);
  if (sessionAuthenticated === true) {
    return next();
  }

  if (res.headersSent) {
    return;
  }

  const firebaseAuthenticated = await authenticateWithFirebase(req, res);
  if (firebaseAuthenticated === true) {
    return next();
  }

  if (res.headersSent) {
    return;
  }

  return unauthorized(res);
};

export const authenticateFirebaseOnly = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const firebaseAuthenticated = await authenticateWithFirebase(req, res);
  if (firebaseAuthenticated === true) {
    return next();
  }

  if (!res.headersSent) {
    return unauthorized(res);
  }
};

export const requireRole = (roles: UserRole | UserRole[] | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return unauthorized(res);
    }

    const userRole = req.user.role as UserRole;
    const userLevel = RoleHierarchy[userRole] || 0;

    if (Array.isArray(roles)) {
      const allowedLevels = roles.map((role) => RoleHierarchy[role as UserRole] || 0);
      if (!roles.includes(userRole) && userLevel < Math.max(...allowedLevels)) {
        return forbidden(res);
      }

      return next();
    }

    const requiredLevel = RoleHierarchy[roles as UserRole] || 0;
    if (userLevel < requiredLevel) {
      return forbidden(res);
    }

    next();
  };
};

export const requirePermission = (module: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return unauthorized(res);
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    const permission = await prisma.permission.findFirst({
      where: {
        roleId: req.user.role,
        module,
        action: { in: [action, 'ALL'] },
        allowed: true,
      },
    });

    if (!permission) {
      return forbidden(res);
    }

    next();
  };
};

export const enforceApiAuthentication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!(req.path.startsWith('/v1') || req.path.startsWith('/v2')) || isPublicApiRoute(req.path)) {
    return next();
  }

  return authenticate(req, res, next);
};

export const checkSubscriptionQuota = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next();
  }

  const control = await prisma.subscriptionControl.findUnique({
    where: { userId: req.user.id },
  });

  if (!control || control.canSubscribe) {
    return next();
  }

  return forbidden(res);
};
