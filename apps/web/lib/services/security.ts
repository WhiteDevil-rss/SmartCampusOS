import { api } from '@/lib/api';

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  type: string;
  location?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  reportedById: string;
  officerId?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: { name: string; email: string };
  officer?: { name: string; role: string };
  analysis?: SecurityAnalysis;
}

export interface SecurityAnalysis {
  id: string;
  incidentId: string;
  priority: number;
  summary: string;
  riskAssessment: string;
  recommendation: string;
  isEmergency: boolean;
  createdAt: string;
}

export interface SecurityIntelligence {
  status: 'SAFE' | 'ELEVATED' | 'CRITICAL';
  summary: string;
  hotspots: Array<{ location: string; incidentCount: number; primaryThreat: string }>;
  trendAnalysis: string;
  suggestedPatrolFocus: string[];
}

export const securityService = {
  getIncidents: async (universityId: string) => {
    const response = await api.get(`/v2/security/${universityId}/incidents`);
    return response.data;
  },

  getIncidentById: async (universityId: string, id: string) => {
    const response = await api.get(`/v2/security/${universityId}/incidents`, {
      params: { incidentId: id },
    });
    return response.data;
  },

  reportIncident: async (universityId: string, data: any) => {
    const response = await api.post(`/v2/security/${universityId}/incidents`, data);
    return response.data;
  },

  updateIncidentStatus: async (id: string, status: string, officerId?: string) => {
    const response = await api.put(`/v2/security/incidents/${id}`, { status, officerId });
    return response.data;
  },

  getIntelligence: async (universityId: string) => {
    const response = await api.get(`/v2/security/${universityId}/intelligence`);
    return response.data;
  },

  assignOfficer: async (incidentId: string, officerId: string) => {
    const response = await api.put(`/v2/security/incidents/${incidentId}`, { officerId, status: 'INVESTIGATING' });
    return response.data;
  },

  getOfficers: async (universityId: string) => {
    // This would typically be a user search with role=SECURITY_OFFICER or similar
    const response = await api.get('/users', {
      params: {
        role: 'SECURITY_OFFICER',
        universityId,
      },
    });
    return response.data;
  }
};
