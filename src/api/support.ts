import api from '../lib/api'
import { httpClient } from './http'

export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type MessageSenderType = 'ADMIN' | 'AGENT' | 'SOURCE'

export interface SupportTicket {
  id: string
  title: string
  status: SupportTicketStatus
  createdById: string
  createdBy: {
    id: string
    companyName: string
    type: 'AGENT' | 'SOURCE'
    email: string
  }
  assignedTo?: string | null
  createdAt: string
  updatedAt: string
  unreadCount?: number
  lastMessage?: SupportMessage | null
  messageCount?: number
}

export interface SupportMessage {
  id: string
  ticketId: string
  senderId: string
  senderType: MessageSenderType
  content?: string | null
  imageUrl?: string | null
  readAt?: string | null
  createdAt: string
}

export interface CreateTicketRequest {
  title: string
  initialMessage?: string
}

export interface SendMessageRequest {
  content?: string
  image?: File
}

export interface TicketsResponse {
  items: SupportTicket[]
  total: number
}

export interface MessagesResponse {
  items: SupportMessage[]
  total: number
}

export const supportApi = {
  getTickets: async (params?: { status?: SupportTicketStatus }): Promise<TicketsResponse> => {
    const response = await api.get('/api/support/tickets', { params })
    return response.data
  },

  getTicket: async (id: string): Promise<SupportTicket> => {
    const response = await api.get(`/api/support/tickets/${id}`)
    return response.data
  },

  createTicket: async (data: CreateTicketRequest): Promise<SupportTicket> => {
    const response = await api.post('/api/support/tickets', data)
    return response.data
  },

  getMessages: async (ticketId: string): Promise<MessagesResponse> => {
    const response = await api.get(`/api/support/tickets/${ticketId}/messages`)
    return response.data
  },

  sendMessage: async (ticketId: string, data: SendMessageRequest): Promise<SupportMessage> => {
    const formData = new FormData()
    
    // ALWAYS append content - if provided, use it; if image-only, use empty string
    // This ensures backend always receives a content field
    if (data.content !== undefined && data.content !== null) {
      formData.append('content', data.content)
    } else if (data.image) {
      // If we have image but no content, send empty string to satisfy backend requirement
      formData.append('content', '')
    }
    
    // Append image if provided - this is critical for image-only messages
    if (data.image) {
      formData.append('image', data.image)
    }

    // Debug: Log FormData contents (ALWAYS in dev, helps with debugging)
    console.log('[Support API] Preparing FormData:', {
      hasContent: formData.has('content'),
      hasImage: formData.has('image'),
      contentValue: data.content,
      contentType: typeof data.content,
      imageName: data.image?.name,
      imageSize: data.image?.size,
      imageType: data.image?.type,
    });
    
    // Try to log FormData entries
    try {
      const entries: any[] = [];
      for (const [key, value] of formData.entries()) {
        entries.push({
          key,
          valueType: value instanceof File ? 'File' : typeof value,
          valuePreview: value instanceof File 
            ? `${value.name} (${value.size} bytes, ${value.type})` 
            : String(value).substring(0, 100),
        });
      }
      console.log('[Support API] FormData entries:', entries);
    } catch (e) {
      console.error('[Support API] Error logging FormData entries:', e);
    }

    // Don't set Content-Type header - browser will set it automatically with boundary for FormData
    // This ensures Authorization header is properly included
    // Use httpClient directly for FormData to avoid SDK client wrapper issues
    console.log('[Support API] Calling httpClient.post with FormData');
    const response = await httpClient.post<SupportMessage>(`/api/support/tickets/${ticketId}/messages`, formData)
    console.log('[Support API] Received response:', response);
    return response
  },

  markMessageRead: async (ticketId: string, messageId: string): Promise<void> => {
    await api.post(`/api/support/tickets/${ticketId}/messages/${messageId}/read`)
  },
}
