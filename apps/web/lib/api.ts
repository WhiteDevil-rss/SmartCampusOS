import axios from 'axios';
import { auth } from './firebase';
import { useAuthStore } from './store/useAuthStore';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config: any) => {
    // Dynamically adjust baseURL if the route expects v2
    if (config.url && config.url.startsWith('/v2/')) {
        let base = config.baseURL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1');

        // Remove trailing slash if present
        if (base.endsWith('/')) base = base.slice(0, -1);

        if (base.endsWith('/v1')) {
            config.baseURL = base.replace('/v1', '');
            if (process.env.NODE_ENV === 'development') {
                console.log(`[API V2 Proxy] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
            }
        }
    }

    // Wait for Firebase to initialize before checking currentUser
    await auth.authStateReady();
    const user = auth.currentUser;
    if (user && config.headers) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response: any) => {
        // Log 200 null for debugging (optional, but good for "graceful" tracking)
        if (response.status === 200 && response.data === null) {
            if (process.env.NODE_ENV === 'development') {
                console.info(`[API Graceful State] ${response.config.method?.toUpperCase()} ${response.config.url} returned null`);
            }
        }
        return response;
    },
    async (error: any) => {
        const originalRequest = error.config;

        // Handle Network Errors (No response from server)
        if (!error.response) {
            console.warn('API: Network Error - Server might be offline');
            if (typeof window !== 'undefined') {
                useAuthStore.getState().setBackendError('NETWORK_ERROR');
            }
            return Promise.reject(error);
        }

        // Handle specific status codes for UX
        const status = error.response.status;
        const msg = error.response.data?.message || error.response.data?.error || 'Unknown Error';

        if (status >= 500) {
            console.error(`[API Server Error] ${status}: ${msg}`);
            // Potential global toast trigger here if store available
        } else if (status === 404) {
             console.warn(`[API Missing] ${error.config.url} not found`);
        }

        // If 401 and it hasn't been retried yet
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const user = auth.currentUser;
                if (user) {
                    console.log('API: Token expired, attempting refresh...');
                    const newToken = await user.getIdToken(true);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('API: Token refresh failed:', refreshError);
            }

            console.warn('Unauthorized access detected. Current path:', typeof window !== 'undefined' ? window.location.pathname : 'unknown');
            await auth.signOut();
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
