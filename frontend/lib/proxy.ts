import { BACKEND_URL } from './backend-url';

export const PROXY_CONFIG = {
  // Backend server URL
  backendUrl: BACKEND_URL,
  
  // API routes to proxy
  apiRoutes: {
    // Authentication routes
    auth: '/api/v1/auth',
    
    // Service routes
    services: '/api/v1/services',
    
    // Booking routes
    bookings: '/api/v1/bookings',
    
    // Wallet routes
    wallet: '/api/v1/wallet',
    
    // Review routes
    reviews: '/api/v1/reviews',
    
    // Ticket routes
    tickets: '/api/v1/tickets',
    
    // Chat/Message routes
    messages: '/api/v1/messages',
    
    // Notification routes
    notifications: '/api/v1/notifications',
    
    // Admin routes
    admin: '/api/v1/admin',
  },
  
  // File upload routes
  uploadRoutes: {
    uploads: '/uploads',
  },
  
  // Proxy middleware configuration
  middleware: {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

/**
 * Get the full proxied URL for a given API path
 * @param path - The API path (e.g., '/api/v1/auth/login')
 * @returns The full backend URL
 */
export function getProxiedUrl(path: string): string {
  return `${BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Proxy configuration for development vs production
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

export const proxySettings = {
  development: {
    target: BACKEND_URL,
    changeOrigin: true,
    secure: false,
  },
  production: {
    target: BACKEND_URL,
    changeOrigin: true,
    secure: true,
  },
};
