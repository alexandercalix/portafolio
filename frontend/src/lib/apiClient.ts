const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api';

/**
 * Generic fetch wrapper with retries and timeout for handling Azure Functions cold-starts.
 */
export async function fetchWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3,
  delayMs = 1500,
  timeoutMs = 10000
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Auto-inject JSON Content-Type if we are not sending FormData
  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers || {});
  
  if (!isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
  }

  // Ensure options.cache is strictly "no-store" 
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    cache: 'no-store'
  };

  // During GitHub Actions (CI) builds, Azure cold starts can take up to 30 seconds.
  // A 10s timeout will abort the cold start before it finishes, causing the build to fail.
  const actualTimeoutMs = process.env.CI ? 60000 : timeoutMs;

  let attempt = 0;
  let lastError: any = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), actualTimeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Status Validation
      if (!response.ok) {
        // Do not retry client errors (400, 401, 403, 404)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client Error: ${response.status} ${response.statusText}`);
        }
        
        // Throw to trigger retry for 500, 502, 503, 504
        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
      }

      // Success parsing
      const text = await response.text();
      if (!text) {
          return {} as T;
      }
  
      try {
          return JSON.parse(text) as T;
      } catch {
          return text as any as T;
      }

    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;

      // If it's a client error (which we explicitly threw), we abort the retry loop
      if (error.message?.startsWith('Client Error')) {
        throw error;
      }

      // If retries exhausted, throw
      if (attempt === retries) {
        throw new Error(`fetchWithRetry failed after ${retries} retries: ${error.message}`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
      attempt++;
    }
  }

  throw lastError;
}
