import { fetchWithRetry } from '../apiClient';
import { BlogPost, PagedResult } from '../../models/types';

export async function getBlogPosts(page = 1, pageSize = 10, token?: string, includeDrafts = false): Promise<PagedResult<BlogPost>> {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const endpoint = includeDrafts ? `/cms/blogs?page=${page}&pageSize=${pageSize}` : `/blogs?page=${page}&pageSize=${pageSize}`;
    return fetchWithRetry<PagedResult<BlogPost>>(endpoint, {
        headers,
        ...(includeDrafts ? { cache: 'no-store' } : { next: { revalidate: 60 } })
    });
}

export async function postBlogPost(formData: FormData, token: string): Promise<BlogPost> {
    return fetchWithRetry<BlogPost>('/blogs', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
}

export async function putBlogPost(id: string, formData: FormData, token: string): Promise<BlogPost> {
    return fetchWithRetry<BlogPost>(`/blogs/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        return await fetchWithRetry<BlogPost>(`/blogs/${slug}`, {
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
        return await fetchWithRetry<BlogPost>(`/cms/blogs/${id}`, {
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
