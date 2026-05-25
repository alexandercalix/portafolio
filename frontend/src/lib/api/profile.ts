import { fetchWithRetry } from '../apiClient';
import { SiteProfile } from '../../models/types';

export async function getGlobalProfile(): Promise<SiteProfile> {
    return await fetchWithRetry<SiteProfile>('/profile', {
        next: { revalidate: 60 } // Revalidate every 60 seconds
    });
}

export async function putGlobalProfile(formData: FormData, token: string): Promise<SiteProfile> {
    return await fetchWithRetry<SiteProfile>('/profile', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
}
