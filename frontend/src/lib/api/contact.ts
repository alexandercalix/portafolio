import { fetchApi } from '../apiClient';
import { ContactMessage, PagedResult } from '../../models/types';

export async function getMessages(page = 1, pageSize = 10, token: string, status?: string): Promise<PagedResult<ContactMessage>> {
    let endpoint = `/cms/messages?page=${page}&pageSize=${pageSize}`;
    if (status && status !== 'All') {
        endpoint += `&status=${encodeURIComponent(status)}`;
    }
    return await fetchApi<PagedResult<ContactMessage>>(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
    });
}

export async function updateMessageStatus(id: string, status: string, token: string): Promise<void> {
    await fetchApi<any>(`/cms/messages/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
}

export async function deleteMessage(id: string, token: string): Promise<void> {
    await fetchApi<any>(`/cms/messages/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}
