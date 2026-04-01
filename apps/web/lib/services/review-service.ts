import { api } from '../api';

export interface PendingReview {
  id: string;
  grantId: string;
  reviewerId: string;
  status: 'PENDING' | 'COMPLETED';
  grant: {
    id: string;
    title: string;
    agency: string;
    amount: number;
    description: string;
    proposalBody: string;
  };
}

export interface ReviewSubmission {
  score: number;
  recommendation: 'APPROVE' | 'REVISE' | 'REJECT';
  comments: string;
  rubric?: any;
}

export const reviewService = {
  getPendingReviews: async (): Promise<PendingReview[]> => {
    const response = await api.get('/v2/research/reviews/pending');
    return response.data;
  },

  submitReview: async (reviewId: string, data: ReviewSubmission) => {
    const response = await api.post(`/v2/research/reviews/${reviewId}`, data);
    return response.data;
  },

  getGrantReviews: async (grantId: string) => {
    const response = await api.get(`/v2/research/grants/${grantId}/reviews`);
    return response.data;
  },

  assignReviewers: async (grantId: string, reviewerIds: string[]) => {
    const response = await api.post(`/v2/research/grants/${grantId}/assign-reviewers`, { reviewerIds });
    return response.data;
  }
};
