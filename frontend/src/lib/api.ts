// src/lib/api.ts

export interface PagedResult<T> {
    data: T[];
    totalRecords: number;
    currentPage: number;
    totalPages: number;
}

export interface SiteProfile {
    id: string;
    name: string;
    headline: string;
    bio: string;
    avatarUrl?: string;
    resumeUrl?: string;
    githubUrl?: string;
    linkedInUrl?: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    description: string;
    liveUrl?: string;
    repositoryUrl?: string;
    images: string[];
    thumbnailUrl?: string;
    technologies: string[];
    author?: {
        name: string;
        avatarUrl?: string;
    };
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    category?: string;
    tags: string[];
    technologies: string[];
    thumbnailUrl?: string;
    author?: {
        name: string;
        avatarUrl?: string;
    };
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api';

/**
 * Generic fetch wrapper to handle JSON parsing and errors.
 */
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    });

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

    return JSON.parse(text) as T;
}

export async function getGlobalProfile(): Promise<SiteProfile | null> {
    try {
        return await fetchApi<SiteProfile>('/profile', {
            cache: 'no-store'
        });
    } catch (err) {
        if (err instanceof Error && err.message === 'Not Found') {
            return null;
        }
        throw err;
    }
}

export async function putGlobalProfile(formData: FormData, token: string): Promise<SiteProfile> {
    return fetchApi<SiteProfile>('/profile', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
}

export async function getProjects(page = 1, pageSize = 10, token?: string, includeDrafts = false): Promise<PagedResult<Project>> {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const endpoint = includeDrafts ? `/cms/projects?page=${page}&pageSize=${pageSize}` : `/projects?page=${page}&pageSize=${pageSize}`;
    return fetchApi<PagedResult<Project>>(endpoint, {
        headers,
        ...(includeDrafts ? { cache: 'no-store' } : { next: { revalidate: 60 } })
    });
}

export async function postProject(formData: FormData, token: string): Promise<Project> {
    return fetchApi<Project>('/projects', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
}

export async function putProject(id: string, formData: FormData, token: string): Promise<Project> {
    return fetchApi<Project>(`/projects/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
    try {
        return await fetchApi<Project>(`/projects/${slug}`, {
            next: { revalidate: 60 }
        });
    } catch (err) {
        if (err instanceof Error && err.message === 'Not Found') {
            return null;
        }
        throw err;
    }
}

export async function getProjectById(id: string, token: string): Promise<Project | null> {
    try {
        return await fetchApi<Project>(`/cms/projects/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });
    } catch (err) {
        if (err instanceof Error && err.message === 'Not Found') {
            return null;
        }
        throw err;
    }
}

export async function getBlogPosts(page = 1, pageSize = 10, token?: string, includeDrafts = false): Promise<PagedResult<BlogPost>> {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const endpoint = includeDrafts ? `/cms/blogs?page=${page}&pageSize=${pageSize}` : `/blogs?page=${page}&pageSize=${pageSize}`;
    return fetchApi<PagedResult<BlogPost>>(endpoint, {
        headers,
        ...(includeDrafts ? { cache: 'no-store' } : { next: { revalidate: 60 } })
    });
}

export async function postBlogPost(formData: FormData, token: string): Promise<BlogPost> {
    return fetchApi<BlogPost>('/blogs', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
}

export async function putBlogPost(id: string, formData: FormData, token: string): Promise<BlogPost> {
    return fetchApi<BlogPost>(`/blogs/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        return await fetchApi<BlogPost>(`/blogs/${slug}`, {
            next: { revalidate: 60 }
        });
    } catch (err) {
        if (err instanceof Error && err.message === 'Not Found') {
            return null;
        }
        throw err;
    }
}

export async function getBlogPostById(id: string, token: string): Promise<BlogPost | null> {
    try {
        return await fetchApi<BlogPost>(`/cms/blogs/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });
    } catch (err) {
        if (err instanceof Error && err.message === 'Not Found') {
            return null;
        }
        throw err;
    }
}
