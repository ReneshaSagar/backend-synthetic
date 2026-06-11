import { geminiService } from '../services/gemini';
import { IdeaAnalysis } from '../types';
import {
  IDEA_ANALYZER_SYSTEM,
  formatIdeaAnalyzerPrompt,
  IDEA_ANALYZER_SCHEMA
} from '../prompts/templates';

export const analyzerAgent = {
  /**
   * Run the Idea Analyzer Agent
   */
  async analyzeIdea(ideaText: string): Promise<IdeaAnalysis> {
    if (!ideaText || ideaText.trim() === '') {
      throw new Error('Idea text cannot be empty.');
    }

    const systemInstruction = IDEA_ANALYZER_SYSTEM;
    const userPrompt = formatIdeaAnalyzerPrompt(ideaText);

    try {
      const result = await geminiService.callGeminiJSON<IdeaAnalysis>(
        systemInstruction,
        userPrompt,
        IDEA_ANALYZER_SCHEMA
      );
      
      // Perform basic validation on schema fields
      if (!result.industry || !result.targetAudience || !result.keyValueProposition) {
        throw new Error('Idea Analyzer Agent returned incomplete analysis data.');
      }

      return {
        industry: result.industry,
        targetAudience: result.targetAudience,
        stakeholders: result.stakeholders || [],
        businessType: result.businessType,
        competitors: result.competitors || [],
        keyValueProposition: result.keyValueProposition
      };
    } catch (error) {
      console.error('Error in analyzerAgent.analyzeIdea:', error);
      throw error;
    }
  }
};
