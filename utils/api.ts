// API utility to attach bearer token to requests

export interface ApiRequestInit extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiRequest(url: string, options: ApiRequestInit = {}): Promise<Response> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header if token exists and auth is required
  if (requiresAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  return fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  });
}

// Convenience methods
export const api = {
  get: (url: string, options?: ApiRequestInit) =>
    apiRequest(url, { ...options, method: 'GET' }),

  post: (url: string, data?: any, options?: ApiRequestInit) =>
    apiRequest(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (url: string, data?: any, options?: ApiRequestInit) =>
    apiRequest(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (url: string, options?: ApiRequestInit) =>
    apiRequest(url, { ...options, method: 'DELETE' }),
};

