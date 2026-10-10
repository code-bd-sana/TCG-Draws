export type ReviewStatus = 'APPROVED' | 'FLAGGED' | 'HIDDEN' | 'approved' | 'flagged' | 'under_review' | 'removed';

export interface HostReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  prizeWon: string;
  competitionTitle: string;
  competitionSlug?: string;
  competitionImage?: string | null;
  isVerifiedWinner: boolean;
}

export interface StarBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface HostReviewStats {
  averageRating: number | null;
  totalReviews: number;
  breakdown: StarBreakdown;
  percentages: StarBreakdown;
}

export interface HostReviewsApiResponse {
  reviews: HostReviewItem[];
  stats: HostReviewStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MyReviewItem {
  id: string;
  hostId: string;
  hostName: string;
  hostSlug: string;
  hostLogo?: string | null;
  raffleId: string;
  winnerId: string;
  prizeWon: string;
  competitionTitle: string;
  competitionSlug: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostDashboardReviewsResponse {
  metrics: {
    averageRating: number | null;
    totalReviews: number;
    satisfactionRate: number | null;
    breakdown: StarBreakdown;
    percentages: StarBreakdown;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    status: string;
    createdAt: string;
    reviewerName: string;
    reviewerAvatar: string | null;
    prizeWon: string;
    competitionTitle: string;
    competitionSlug: string;
  }>;
}

// Backward-compatibility interface for existing mocks/types
export interface HostReview {
  id: string;
  hostId?: string;
  reviewerName: string;
  rating: number;
  message?: string;
  comment?: string | null;
  competitionTitle?: string;
  createdAt: string;
  status?: string;
  canBeFlagged?: boolean;
}
