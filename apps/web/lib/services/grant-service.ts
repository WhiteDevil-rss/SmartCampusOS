import { api } from '../api';

export interface ResearchGrant {
  id: string;
  title: string;
  agency: string;
  amount: number;
  status: 'PROPOSAL_DRAFT' | 'INTERNAL_REVIEW' | 'EXTERNAL_SUBMITTED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED';
  description?: string;
  proposalBody?: string;
  budgetBreakdown?: any;
  reviewComments?: any;
  startDate: string;
  endDate?: string;
}

export const grantService = {
  getGrants: async (): Promise<ResearchGrant[]> => {
    const response = await api.get('/v2/research/nexus');
    return response.data.grants;
  },

  createGrant: async (data: Partial<ResearchGrant>): Promise<ResearchGrant> => {
    const response = await api.post('/v2/research/grants', data);
    return response.data;
  },

  generateProposal: async (grantId: string): Promise<ResearchGrant> => {
    const response = await api.post(`/v2/research/grants/${grantId}/generate`);
    return response.data;
  },

  updateGrant: async (grantId: string, data: { status?: string, reviewComments?: any }): Promise<ResearchGrant> => {
    const response = await api.patch(`/v2/research/grants/${grantId}`, data);
    return response.data;
  },

  getGrantFinancials: async (grantId: string) => {
    const response = await api.get(`/v2/research/grants/${grantId}/financials`);
    return response.data;
  },

  logExpenditure: async (grantId: string, data: { amount: number; description: string; category: string; date?: string }) => {
    const response = await api.post(`/v2/research/grants/${grantId}/expenditures`, data);
    return response.data;
  },

  analyzeEthics: async (grantId: string) => {
    const response = await api.post(`/v2/research/grants/${grantId}/ethics-analysis`);
    return response.data;
  }
};
