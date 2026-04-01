import axios, { type AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from './store/useAuthStore';
import { useSessionStore } from './store/useSessionStore';
import type { User } from './store/useAuthStore';

export interface AppAxiosRequestConfig extends AxiosRequestConfig {
    skipAuthRedirect?: boolean;
}

export interface AuthPayload {
    user: Pick<User, 'id' | 'username' | 'email' | 'role' | 'entityId' | 'universityId'>;
    redirectUrl?: string;
    sessionTimeout?: number;
    warningMinutes?: number;
    token?: string | null;
    refreshToken?: string | null;
}

export const FRONTEND_SESSION_COOKIE = 'scos_frontend_session';
export const FRONTEND_ROLE_COOKIE = 'scos_frontend_role';

export const hasFrontendSessionHint = () => Boolean(Cookies.get(FRONTEND_SESSION_COOKIE));
export const getFrontendRoleHint = () => Cookies.get(FRONTEND_ROLE_COOKIE) ?? null;

export const getRoleHomePath = (role?: string | null) => {
    switch (role) {
        case 'SUPERADMIN':
            return '/superadmin';
        case 'UNI_ADMIN':
        case 'COLLEGE_ADMIN':
        case 'LIBRARIAN':
        case 'PLACEMENT_OFFICER':
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

export const getAuthPayload = (responseData: any): AuthPayload | null => {
    if (!responseData) return null;
    return responseData.data ?? responseData;
};

export const setFrontendAuthHints = (role?: string | null) => {
    Cookies.set(FRONTEND_SESSION_COOKIE, '1', { sameSite: 'lax', path: '/' });
    if (role) {
        Cookies.set(FRONTEND_ROLE_COOKIE, role, { sameSite: 'lax', path: '/' });
    } else {
        Cookies.remove(FRONTEND_ROLE_COOKIE, { path: '/' });
    }
};

export const clearFrontendAuthHints = () => {
    Cookies.remove(FRONTEND_SESSION_COOKIE, { path: '/' });
    Cookies.remove(FRONTEND_ROLE_COOKIE, { path: '/' });
};

const getResolvedApiUrl = () => {
    const configuredUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/v1';

    if (typeof window === 'undefined') {
        return configuredUrl;
    }

    try {
        const resolved = new URL(configuredUrl);
        const currentHost = window.location.hostname;
        const localHosts = new Set(['localhost', '127.0.0.1']);

        if (localHosts.has(resolved.hostname) && localHosts.has(currentHost) && resolved.hostname !== currentHost) {
            resolved.hostname = currentHost;
        }

        return resolved.toString();
    } catch {
        return configuredUrl;
    }
};

const API_URL = getResolvedApiUrl();

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config: any) => {
    if (config.url && config.url.startsWith('/v2/')) {
        let base = config.baseURL || API_URL;
        if (base.endsWith('/')) base = base.slice(0, -1);
        if (base.endsWith('/v1')) {
            config.baseURL = base.replace('/v1', '');
        }
    }

    const csrfToken = Cookies.get('scos_csrf');
    const method = (config.method || 'get').toUpperCase();
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        config.headers = config.headers || {};
        config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: any) => {
        if (!error.response) {
            if (typeof window !== 'undefined') {
                useAuthStore.getState().setBackendError('NETWORK_ERROR');
            }
            return Promise.reject(error);
        }

        const status = error.response.status;
        const requestConfig = error.config as AppAxiosRequestConfig | undefined;
        if (status === 401 && !requestConfig?.skipAuthRedirect) {
            clearFrontendAuthHints();
            useAuthStore.getState().logout();
            useSessionStore.getState().reset();
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                const reason = Cookies.get('scos_logout_reason');
                const params = new URLSearchParams();
                if (reason === 'session-expired') params.set('expired', 'true');
                if (reason === 'password-changed') params.set('passwordChanged', 'true');
                const suffix = params.toString() ? `?${params.toString()}` : '';
                window.location.href = `/login${suffix}`;
            }
        }

        return Promise.reject(error);
    }
);
