import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface IdeaAnalysis {
  industry: string;
  targetAudience: string[];
  stakeholders: string[];
  experts: string[];
  summary: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  background: string;
  motivations: string;
  concerns: string;
}

export interface Simulation {
  personaId: string;
  reaction: string;
  interestScore: number;
  objections: string[];
  suggestions: string[];
}

export interface Report {
  interestScore: number;
  mostInterestedSegment: string;
  commonConcerns: string[];
  suggestedImprovements: string[];
  faqs: { question: string; answer: string }[];
  markdownContent: string;
}

export const analyzeIdea = async (idea: string) => {
  const response = await axios.post(`${API_URL}/analyze-idea`, { idea });
  return response.data;
};

export const generateAudience = async (ideaId: string) => {
  const response = await axios.post(`${API_URL}/generate-audience`, { ideaId });
  return response.data;
};

export const simulate = async (ideaId: string) => {
  const response = await axios.post(`${API_URL}/simulate`, { ideaId });
  return response.data;
};

export const generateReport = async (ideaId: string) => {
  const response = await axios.post(`${API_URL}/generate-report`, { ideaId });
  return response.data;
};

export const fullAnalysis = async (idea: string) => {
  const response = await axios.post(`${API_URL}/full-analysis`, { idea });
  return response.data;
};
