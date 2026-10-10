import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  reviewsService,
  CreateReviewPayload,
  UpdateReviewPayload,
} from '../services/reviews.service';

export const useHostReviewsQuery = (
  hostId: string | undefined,
  params?: { page?: number; limit?: number; rating?: number },
) => {
  return useQuery({
    queryKey: ['host-reviews', hostId, params?.page, params?.limit, params?.rating],
    queryFn: () => reviewsService.getHostReviews(hostId!, params),
    enabled: !!hostId,
  });
};

export const useMyReviewsQuery = () => {
  return useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewsService.getMyReviews(),
  });
};

export const useHostDashboardReviewsQuery = () => {
  return useQuery({
    queryKey: ['host-dashboard-reviews'],
    queryFn: () => reviewsService.getHostDashboardReviews(),
  });
};

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsService.createReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-winners'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['host-reviews'] });
    },
  });
};

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewPayload }) =>
      reviewsService.updateReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-winners'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['host-reviews'] });
    },
  });
};

export const useFlagReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason?: string }) =>
      reviewsService.flagReview(reviewId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['host-dashboard-reviews'] });
    },
  });
};
