import { api } from '../api';

export interface Publication {
    id: string;
    title: string;
    abstract: string | null;
    journal: string | null;
    publicationDate: string;
    doi: string | null;
    citationsCount: number;
    impactFactor: number | null;
}

export interface ResearchGrant {
    id: string;
    title: string;
    agency: string;
    amount: number;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'REJECTED';
    startDate: string;
    endDate: string | null;
}

export interface ResearchNexusData {
    publications: Publication[];
    grants: ResearchGrant[];
    stats: {
        totalPublications: number;
        totalCitations: number;
        hIndex: number;
        activeGrantsTotal: number;
        researchImpactScore: number;
    };
}

export interface ImpactAnalysis {
    predictedImpactScore: number;
    suggestedJournals: string[];
    keyKeywords: string[];
    improvementSuggestions: string;
}

export const getResearchNexus = async (): Promise<ResearchNexusData> => {
    const response = await api.get('/v2/research/nexus');
    return response.data;
};

export const createPublication = async (data: Partial<Publication>): Promise<Publication> => {
    const response = await api.post('/v2/research/publications', data);
    return response.data;
};

export const createGrant = async (data: Partial<ResearchGrant>): Promise<ResearchGrant> => {
    const response = await api.post('/v2/research/grants', data);
    return response.data;
};

export const analyzeImpact = async (abstract: string): Promise<ImpactAnalysis> => {
    const response = await api.post('/v2/research/analyze-impact', { abstract });
    return response.data;
};
