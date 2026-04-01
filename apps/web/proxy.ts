import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = [
  '/login',
  '/admin/login',
  '/forgot-password',
  '/reset-password',
];

const PUBLIC_PREFIXES = ['/public', '/_next', '/api', '/favicon.ico'];

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.includes(pathname) ||
  PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === '/register' || pathname === '/signup') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const sessionToken =
    request.cookies.get('scos_session')?.value ||
    request.cookies.get('scos_frontend_session')?.value;
  const role =
    request.cookies.get('scos_role')?.value ||
    request.cookies.get('scos_frontend_role')?.value;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (role) {
    const rolePrefixes: Record<string, string[]> = {
      SUPERADMIN: ['/superadmin', '/dashboard', '/history', '/profile', '/settings'],
      UNI_ADMIN: ['/dashboard', '/history', '/profile', '/settings'],
      COLLEGE_ADMIN: ['/dashboard', '/history', '/profile', '/settings'],
      DEPT_ADMIN: ['/department', '/history', '/profile', '/settings'],
      FACULTY: ['/faculty-panel', '/faculty', '/history', '/profile', '/settings'],
      STUDENT: ['/student', '/history', '/settings'],
      PARENT: ['/student', '/history', '/settings'],
      LIBRARIAN: ['/dashboard', '/history', '/profile', '/settings'],
      PLACEMENT_OFFICER: ['/dashboard', '/history', '/profile', '/settings'],
      APPROVAL_ADMIN: ['/approval', '/history', '/profile', '/settings'],
    };

    const allowedPrefixes = rolePrefixes[role] || [];
    const isAuthorized = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

    if (!isAuthorized && pathname !== '/login') {
      const homePath = getRoleHomePath(role);
      if (pathname !== homePath) {
        return NextResponse.redirect(new URL(homePath, request.url));
      }
    }
  }

  return NextResponse.next();
}

function getRoleHomePath(role?: string | null) {
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
    case 'LIBRARIAN':
    case 'PLACEMENT_OFFICER':
      return '/dashboard';
    case 'APPROVAL_ADMIN':
      return '/approval';
    default:
      return '/login';
  }
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
};
