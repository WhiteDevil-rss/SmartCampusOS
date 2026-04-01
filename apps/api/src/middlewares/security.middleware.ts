import type { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
  AUTH_REQUIRED_MESSAGE,
  CSRF_COOKIE_NAME,
  FORBIDDEN_MESSAGE,
} from '../lib/security';

const authRateLimitStore = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_AUTH_ATTEMPTS_PER_WINDOW = 10;

const PUBLIC_API_PATTERNS = [
  /^\/health$/,
  /^\/v1\/ai-health$/,
  /^\/v1\/auth\/login$/,
  /^\/v1\/auth\/logout$/,
  /^\/v1\/public(\/.*)?$/,
  /^\/v2\/verification\/public(\/.*)?$/,
  /^\/v2\/admission-inquiries\/public\/submit$/,
];

const METHODS_REQUIRING_CSRF = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const cleanString = (value: string) =>
  value.replace(/[<>]/g, '').replace(/\u0000/g, '').trim();

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        sanitizeValue(entry),
      ]),
    );
  }

  return typeof value === 'string' ? cleanString(value) : value;
};

export const isPublicApiRoute = (path: string) =>
  PUBLIC_API_PATTERNS.some((pattern) => pattern.test(path));

export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = sanitizeValue(req.query) as Record<string, unknown>;
    Object.keys(req.query).forEach((key) => {
      delete (req.query as Record<string, unknown>)[key];
    });
    Object.assign(req.query as Record<string, unknown>, sanitizedQuery);
  }

  next();
};

export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const current = authRateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    authRateLimitStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (current.count >= MAX_AUTH_ATTEMPTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
    });
  }

  current.count += 1;
  authRateLimitStore.set(key, current);
  next();
};

export const resetAuthRateLimit = (req: Request) => {
  authRateLimitStore.delete(`${req.ip}:${req.path}`);
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (!METHODS_REQUIRING_CSRF.has(req.method.toUpperCase())) {
    return next();
  }

  if (isPublicApiRoute(req.path) || req.path === '/v1/auth/login') {
    return next();
  }

  const cookieHeader = req.headers.cookie ?? '';
  const cookies = Object.fromEntries(
    cookieHeader
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

  const cookieToken = cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: FORBIDDEN_MESSAGE,
    });
  }

  next();
};

export const ensureSettingsRow = async (_req: Request, _res: Response, next: NextFunction) => {
  await prisma.globalSettings.upsert({
    where: { id: 'system-config' },
    update: {},
    create: { id: 'system-config' },
  });

  next();
};

export const authRequired = (res: Response) =>
  res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
