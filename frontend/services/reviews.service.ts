import { api } from './api';
import {
  HostReviewsApiResponse,
  MyReviewItem,
  HostDashboardReviewsResponse,
} from '../types/review.types';

export interface CreateReviewPayload {
  winnerId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

export const reviewsService = {
  /**
   * Submit a new verified winner review
   */
  async createReview(payload: CreateReviewPayload) {
    const response = await api.post('/reviews', payload);
    return response.data;
  },

  /**
   * Fetch public reviews and stats for a given host
   */
  async getHostReviews(
    hostId: string,
    params?: { page?: number; limit?: number; rating?: number },
  ): Promise<HostReviewsApiResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.rating) query.append('rating', params.rating.toString());

    const queryString = query.toString();
    const url = `/reviews/host/${hostId}${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Fetch reviews submitted by the logged-in user
   */
  async getMyReviews(): Promise<MyReviewItem[]> {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  },

  /**
   * Fetch host received reviews and dashboard metrics
   */
  async getHostDashboardReviews(): Promise<HostDashboardReviewsResponse> {
    const response = await api.get('/reviews/host-dashboard');
    return response.data;
  },

  /**
   * Update an existing review comment and/or rating
   */
  async updateReview(reviewId: string, payload: UpdateReviewPayload) {
    const response = await api.patch(`/reviews/${reviewId}`, payload);
    return response.data;
  },

  /**
   * Flag suspicious review for admin moderation
   */
  async flagReview(reviewId: string, reason?: string) {
    const response = await api.post(`/reviews/${reviewId}/flag`, { reason });
    return response.data;
  },
};
