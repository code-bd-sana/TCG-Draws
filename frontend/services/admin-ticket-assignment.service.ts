import { api } from './api';

export interface CompetitionItem {
  id: string;
  title: string;
  slug: string | null;
  mainImage: string | null;
  pricePerTicket: number;
  totalTickets: number;
  ticketsSold: number;
  remainingTickets: number;
  status: string;
  isAutoDraw: boolean;
  autoDrawSoldOut: boolean;
  minTickets: number;
  maxTickets: number | null;
  startDate: string;
  endDate: string;
  host: {
    id?: string;
    businessName?: string;
    slug?: string;
    ownerName: string;
    email?: string;
    avatarUrl?: string | null;
  };
  instantWinCounts: {
    total: number;
    claimed: number;
    available: number;
  };
}

export interface InstantWinItem {
  id: string;
  ticketNumber: number;
  prizeName: string;
  rrpValue: number | null;
  image: string | null;
  isClaimed: boolean;
}

export interface SoldTicketItem {
  id: string;
  ticketNumber: number;
  purchaseDate: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerAvatar: string | null;
  paymentGateway: string;
  gatewayTransactionId?: string;
}

export interface CompetitionDetails extends Omit<CompetitionItem, 'instantWinCounts'> {
  category: string | null;
  instantWins: InstantWinItem[];
  soldTickets: SoldTicketItem[];
}

export interface RecipientUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string;
  role: string;
  avatar: string | null;
}

export interface AssignTicketsPayload {
  raffleId: string;
  userId: string;
  ticketNumbers?: number[];
  quantity?: number;
  adminNotes?: string;
}

export interface ClaimedInstantWinSummary {
  instantWinId: string;
  ticketNumber: number;
  prizeName: string;
  rrpValue: number | null;
  winnerId: string;
}

export interface AssignTicketsResult {
  success: boolean;
  message: string;
  allocation: {
    transactionId: string;
    gatewayTransactionId: string;
    raffleId: string;
    raffleTitle: string;
    recipient: {
      id: string;
      name: string;
      email: string;
    };
    ticketNumbers: number[];
    quantity: number;
    pricePerTicket: number;
    totalAmount: number;
    hostCredited: number;
    instantWinsClaimed: ClaimedInstantWinSummary[];
    adminNotes?: string | null;
    auditLogId?: string;
  };
}

export interface AssignmentHistoryItem {
  id: string;
  date: string;
  transactionId: string;
  totalValue: number;
  status: string;
  paymentGateway: string;
  recipient: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  competition: {
    id: string;
    title: string;
    slug: string | null;
    mainImage: string | null;
  };
  assignedNumbers: number[];
  ticketsCount: number;
  adminNotes: string | null;
  adminId: string | null;
  instantWins: Array<{
    ticketNumber: number;
    prizeName?: string;
    winType?: string;
  }>;
}

export interface AssignmentHistoryResponse {
  items: AssignmentHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminTicketAssignmentService = {
  async getCompetitions(params?: { q?: string; hostId?: string }): Promise<CompetitionItem[]> {
    const { data } = await api.get('/admin/ticket-assignment/competitions', { params });
    return Array.isArray(data) ? data : data?.data || [];
  },

  async getCompetitionById(id: string): Promise<CompetitionDetails> {
    const { data } = await api.get(`/admin/ticket-assignment/competitions/${id}`);
    return data?.data !== undefined ? data.data : data;
  },

  async searchUsers(q?: string): Promise<RecipientUser[]> {
    const { data } = await api.get('/admin/ticket-assignment/users/search', {
      params: { q },
    });
    return Array.isArray(data) ? data : data?.data || [];
  },

  async assignTickets(payload: AssignTicketsPayload): Promise<AssignTicketsResult> {
    const { data } = await api.post('/admin/ticket-assignment/assign', payload);
    return data?.data !== undefined ? data.data : data;
  },

  async getHistory(params?: { page?: number; limit?: number; search?: string }): Promise<AssignmentHistoryResponse> {
    const { data } = await api.get('/admin/ticket-assignment/history', { params });
    if (data?.items) {
      return data;
    }
    if (data?.data?.items) {
      return data.data;
    }
    return {
      items: data?.items || [],
      meta: data?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },
};
