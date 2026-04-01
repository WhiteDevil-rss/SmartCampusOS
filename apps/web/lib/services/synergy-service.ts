import { api } from '../api';

export interface SynergyMatch {
  targetFacultyId: string;
  targetName: string;
  targetDepartment: string;
  score: number;
  sharedKeywords: string[];
  reason: string;
}

export interface CollaborationProposal {
  title: string;
  goal: string;
}

export const synergyService = {
  getMatches: async (): Promise<SynergyMatch[]> => {
    const response = await api.get('/v2/synergy/matches');
    return response.data;
  },

  proposeCollaboration: async (targetFacultyId: string): Promise<CollaborationProposal> => {
    const response = await api.post('/v2/synergy/propose', { targetFacultyId });
    return response.data;
  }
};
