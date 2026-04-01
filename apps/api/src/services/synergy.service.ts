import prisma from '../lib/prisma';
import { callAiEngine } from './ai.service';
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export interface SynergyMatch {
  targetFacultyId: string;
  targetName: string;
  targetDepartment: string;
  score: number;
  sharedKeywords: string[];
  reason: string;
}

export const getSynergyMatches = async (facultyId: string) => {
  // 1. Fetch all faculty research profiles
  const allFaculty = await prisma.faculty.findMany({
    include: {
      publications: true,
      grants: true, // Renamed from 'researchGrants' in schema
      departments: {
        include: {
          department: true,
        },
      },
    },
  });

  const profiles = allFaculty.map(f => ({
    facultyId: f.id,
    name: f.name,
    department: f.departments[0]?.department?.name || 'General',
    abstracts: [
      ...f.publications.map(p => p.title),
      ...f.publications.map(p => p.abstract).filter((a): a is string => !!a)
    ],
    keywords: f.grants.map(g => g.agency).filter(Boolean) as string[],
  }));

  // 2. Call AI Engine
  try {
    const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5000';
    const response = await axios.post(`${AI_ENGINE_URL}/synergy`, {
      sourceFacultyId: facultyId,
      profiles: profiles
    });

    const matches = response.data.matches as any[];

    // 3. Hydrate matches with names and departments
    return matches.map(m => {
      const target = allFaculty.find(f => f.id === m.targetFacultyId);
      return {
        ...m,
        targetName: target?.name || 'Unknown',
        targetDepartment: target?.departments[0]?.department?.name || 'N/A'
      };
    }) as SynergyMatch[];

  } catch (error: any) {
    console.error('Synergy Engine Error:', error.message);
    throw new Error('Failed to compute research synergy');
  }
};

export const generateCollaborationProposal = async (faculty1Id: string, faculty2Id: string) => {
  const [f1, f2] = await Promise.all([
    prisma.faculty.findUnique({ 
      where: { id: faculty1Id }, 
      include: { 
        publications: true,
        departments: { include: { department: true } }
      } 
    }),
    prisma.faculty.findUnique({ 
      where: { id: faculty2Id }, 
      include: { 
        publications: true,
        departments: { include: { department: true } }
      } 
    }),
  ]);

  if (!f1 || !f2) throw new Error('Faculty members not found');

  const f1Dept = f1.departments[0]?.department?.name || 'N/A';
  const f2Dept = f2.departments[0]?.department?.name || 'N/A';

  const context = `
    Researcher 1 (${f1.name}, ${f1Dept}): ${f1.publications.slice(0, 3).map(p => p.title).join('; ')}
    Researcher 2 (${f2.name}, ${f2Dept}): ${f2.publications.slice(0, 3).map(p => p.title).join('; ')}
  `;

  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama3.2',
      prompt: `Given these two researchers:
      ${context}
      
      Generate a compelling, interdisciplinary research proposal title and a 2-sentence joint goal.
      Format: JSON with fields "title" and "goal".`,
      stream: false,
      format: 'json'
    });

    return JSON.parse(response.data.response);
  } catch (error: any) {
    console.error('Ollama Error:', error.message);
    return {
      title: 'Interdisciplinary Research Initiative',
      goal: 'Explore shared methodologies between the respective domains to drive innovation.'
    };
  }
};
