export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  meta: unknown | null;
  error: { message: string } | null;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json: ApiResponse<T> = await response.json().catch(() => ({ success: false, data: null, meta: null, error: { message: 'Invalid JSON response' } }));

  if (!json.success || !response.ok) {
    throw new ApiError(json.error?.message || 'An unknown error occurred', response.status);
  }

  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => fetchApi<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data: unknown, options?: RequestInit) => fetchApi<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown, options?: RequestInit) => fetchApi<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string, options?: RequestInit) => fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};
