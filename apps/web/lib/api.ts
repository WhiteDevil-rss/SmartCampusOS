import axios from 'axios';
import { auth } from './firebase';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    // Dynamically adjust baseURL if the route expects v2
    if (config.url && config.url.startsWith('/v2/')) {
        let base = config.baseURL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1');

        // Remove trailing slash if present
        if (base.endsWith('/')) base = base.slice(0, -1);

        if (base.endsWith('/v1')) {
            config.baseURL = base.replace('/v1', '');
            console.log(`[API Debug] Routing to V2: ${config.baseURL}${config.url}`);
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
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and it hasn't been retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const user = auth.currentUser;
                if (user) {
                    console.log('API: Token expired, attempting refresh...');
                    // Force refresh the token
                    const newToken = await user.getIdToken(true);

                    // Update the authorization header
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    // Retry the original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('API: Token refresh failed:', refreshError);
            }

            // If refresh fails or no user, sign out
            console.warn('Unauthorized access detected. Current path:', typeof window !== 'undefined' ? window.location.pathname : 'unknown');
            await auth.signOut();
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                console.log('Redirecting to login due to failed auth/token...');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
