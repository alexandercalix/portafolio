const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api';

/**
 * Generic fetch wrapper to handle JSON parsing and errors.
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Auto-inject JSON Content-Type if we are not sending FormData
    const isFormData = options.body instanceof FormData;
    const headers = new Headers(options.headers || {});
    
    if (!isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...options,
        headers,
        next: { revalidate: options.next?.revalidate ?? 0 }, // Prevent aggressive Next.js caching by default
    } as RequestInit & { next?: { revalidate?: number | false, tags?: string[] } });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Not Found');
        }
        throw new Error(`API call failed: ${response.statusText}`);
    }

    // Sometimes a 204 No Content is returned, or empty body
    const text = await response.text();
    if (!text) {
        return {} as T;
    }

    try {
        return JSON.parse(text) as T;
    } catch {
        return text as any as T;
    }
}
