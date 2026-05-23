import { fetchApi } from '../apiClient';

export interface SiteSettings {
    id: string;
    siteName: string;
    faviconUrl?: string | null;
    updatedAt: string;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
    try {
        return await fetchApi<SiteSettings>('/settings', {
            cache: 'no-store'
        });
    } catch (err) {
        if (err instanceof Error && err.message === 'Not Found') {
            return null;
        }
        throw err;
    }
}

export async function putSiteSettings(settings: Partial<SiteSettings>, token: string): Promise<SiteSettings> {
    return fetchApi<SiteSettings>('/settings', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
    });
}
