import { fetchWithRetry } from '../apiClient';

export async function uploadMedia(file: File, token: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return await fetchWithRetry<{ url: string }>('/media/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
}
