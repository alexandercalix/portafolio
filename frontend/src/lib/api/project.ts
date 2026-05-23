import { fetchApi } from '../apiClient';
import { Project, PagedResult } from '../../models/types';

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
