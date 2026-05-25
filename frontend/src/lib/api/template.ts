import { fetchWithRetry } from '../apiClient';

export interface EmailTemplate {
    id: string;
    markdownBody: string;
    updatedAt: string;
}

export async function getEmailTemplate(id: string, token: string): Promise<EmailTemplate | null> {
    try {
        return await fetchWithRetry<EmailTemplate>(`/templates/${id}`, {
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

export async function putEmailTemplate(id: string, markdownBody: string, token: string): Promise<EmailTemplate> {
    return fetchWithRetry<EmailTemplate>(`/templates/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ markdownBody })
    });
}
