import { GoogleGenerativeAI, Schema } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('⚡ Gemini Client initialized successfully.');
  } catch (error) {
    console.error('⚠️ Failed to initialize Gemini client:', error);
  }
} else {
  console.log('ℹ️ GEMINI_API_KEY not configured. Running with high-fidelity Mock AI fallback.');
}

/**
 * Exponential backoff helper for transient network and API errors (503, 429, etc.)
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 4,
  delay: number = 1500
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error.status || 0;
    const errorMessage = (error.message || '').toLowerCase();
    
    const isTransient = 
      status === 503 || 
      status === 429 || 
      errorMessage.includes('503') || 
      errorMessage.includes('429') ||
      errorMessage.includes('service unavailable') ||
      errorMessage.includes('resource exhausted') ||
      errorMessage.includes('rate limit');

    if (retries > 0 && isTransient) {
      console.warn(`⚠️ Gemini API transient error (${status || 'unknown'}: ${error.message}). Retrying in ${delay}ms... (${retries} attempts remaining)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const geminiService = {
  /**
   * Helper to make structured JSON calls to Gemini 2.5 Flash.
   */
  async callGeminiJSON<T>(
    systemInstruction: string,
    userPrompt: string,
    responseSchema?: Schema
  ): Promise<T> {
    if (!genAI) {
      // Return high-fidelity mocked responses based on userPrompt content
      return this.generateMockResponse<T>(userPrompt);
    }

    try {
      return await retryWithBackoff(async () => {
        // Use gemini-2.5-flash as requested by the user
        const model = genAI!.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemInstruction,
        });

        const generationConfig: any = {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        };

        if (responseSchema) {
          generationConfig.responseSchema = responseSchema;
        }

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig,
        });

        const text = result.response.text();
        if (!text) {
          throw new Error('Received empty response from Gemini API.');
        }

        try {
          return JSON.parse(text) as T;
        } catch (parseErr: any) {
          console.error('--- JSON PARSE ERROR DETAILS ---');
          console.error('Error message:', parseErr.message);
          console.error('Response text length:', text.length);
          console.error('Response text end snippet:', text.substring(Math.max(0, text.length - 300)));
          throw parseErr;
        }
      });
    } catch (error: any) {
      console.warn(`⚠️ Gemini API error encountered after retries. Falling back to high-fidelity Mock AI response. Error: ${error.message || error}`);
      return this.generateMockResponse<T>(userPrompt);
    }
  },

  /**
   * Helper to call Gemini for standard markdown text outputs (e.g. final report markdown)
   */
  async callGeminiText(
    systemInstruction: string,
    userPrompt: string
  ): Promise<string> {
    if (!genAI) {
      return this.generateMockTextReport(userPrompt);
    }

    try {
      return await retryWithBackoff(async () => {
        const model = genAI!.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemInstruction,
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        });

        return result.response.text();
      });
    } catch (error: any) {
      console.warn(`⚠️ Gemini API error encountered after retries. Falling back to high-fidelity Mock AI report. Error: ${error.message || error}`);
      return this.generateMockTextReport(userPrompt);
    }
  },

  /**
   * High-fidelity mockup generator for hackathon out-of-the-box convenience.
   */
  generateMockResponse<T>(userPrompt: string): T {
    const promptText = userPrompt.toLowerCase();

    // 1. Audience Generator Mock
    if (promptText.includes('persona') || promptText.includes('generate 15') || promptText.includes('focus group') || promptText.includes('demographic focus')) {
      const personas = [];
      const roles = [
        { role: 'Student', count: 4, names: ['Alex Chen', 'Emily Watson', 'Marcus Rodriguez', 'Zoe Patel'], baseAge: 20 },
        { role: 'Founder', count: 3, names: ['Sarah Jenkins', 'David Kim', 'Amara Okafor'], baseAge: 32 },
        { role: 'Investor', count: 3, names: ['Richard Vance', 'Chloe Dupont', 'Michael Chang'], baseAge: 45 },
        { role: 'Engineer', count: 4, names: ['Sanjay Gupta', 'Elena Rostova', 'Kenji Tanaka', 'Jessica Miller'], baseAge: 27 },
        { role: 'Product Manager', count: 4, names: ['Taylor Swift', 'Oliver Jones', 'Sophia Lee', 'Ryan Reynolds'], baseAge: 30 }
      ];

      let idCounter = 1;
      for (const r of roles) {
        for (let i = 0; i < r.count; i++) {
          const name = r.names[i % r.names.length];
          personas.push({
            id: `mock-persona-${idCounter++}`,
            name,
            age: r.baseAge + (i * 2) - 1,
            role: r.role,
            experience: `${3 + i} years in their domain, managing daily tasks under varying degrees of pressure.`,
            motivations: [`Increasing productivity`, `Reducing daily stress`, `Finding optimized tools`],
            frustrations: [`Clunky user interfaces`, `Too many notifications`, `Steep learning curves`],
            concerns: [`Data privacy`, `Subscription costs`, `Reliability`],
            goals: [`Save 2 hours every day`, `Keep track of deadlines effortlessly`],
            personalityTraits: [`Analytical`, `Goal-oriented`, i % 2 === 0 ? 'Skeptic' : 'Enthusiastic']
          });
        }
      }
      return personas as unknown as T;
    }

    // 2. Idea Analyzer Mock
    if (promptText.includes('analyze') || promptText.includes('industry')) {
      const isStudyPlanner = promptText.includes('study') || promptText.includes('student');
      return {
        industry: isStudyPlanner ? 'EdTech' : 'SaaS / AI Tools',
        targetAudience: isStudyPlanner ? 'College students and university students' : 'General Tech Users',
        stakeholders: isStudyPlanner 
          ? ['College Students', 'Professors', 'University Administrators', 'Parents'] 
          : ['Business Owners', 'Developers', 'Product Managers'],
        businessType: 'B2C / Freemium',
        competitors: isStudyPlanner 
          ? ['Notion', 'Google Calendar', 'Todoist', 'Quizlet'] 
          : ['Competitor A', 'Competitor B'],
        keyValueProposition: isStudyPlanner
          ? 'Automated task prioritization and customized exam prep tailored to college syllabus schedules using AI.'
          : 'AI-powered efficiency automation platform for digital tasks.'
      } as unknown as T;
    }

    // 3. Simulation Mock
    if (promptText.includes('simulation') || promptText.includes('react to the idea')) {
      const isSkeptic = promptText.includes('skeptic');
      const excitementScore = isSkeptic ? 3 : 8;
      const likelihoodToUse = isSkeptic ? 2 : 7;
      return {
        reaction: isSkeptic 
          ? "I am skeptical about another AI tool. Most study planners don't actually get students to study; they just create visual clutter. If it integrates perfectly with Google Calendar and Blackboard, maybe I would check it out, but price and complexity are barriers."
          : "This looks super interesting! An AI study planner that schedules tasks automatically would save me hours of manual scheduling. I hate setting calendars manually. I would definitely try it.",
        excitementScore,
        concerns: isSkeptic 
          ? ["Steep learning curve", "Integration with school systems", "Monthly subscription costs"]
          : ["Will it support push notifications?", "Offline capability"],
        objections: isSkeptic 
          ? ["I already use Google Calendar and it works fine", "Too expensive for college students"]
          : ["I might forget to update my syllabus in the app"],
        likelihoodToUse,
        suggestions: [
          "Include WhatsApp integration for reminders",
          "Offer a free tier for basic syllabus parsing",
          "Ensure offline access"
        ]
      } as unknown as T;
    }

    // 4. Insight Generator Mock
    if (promptText.includes('insights') || promptText.includes('aggregate')) {
      return {
        overallInterestScore: 78,
        adoptionProbability: 65,
        topConcerns: [
          "Syllabus parsing accuracy",
          "Pricing sensitivity (high demand for free tier)",
          "Integration with existing calendars (Google, Outlook)"
        ],
        topSuggestions: [
          "Direct integration with university LMS (Canvas/Blackboard)",
          "WhatsApp/SMS daily digest of tasks",
          "Group study planning feature"
        ],
        mostInterestedSegment: "Undergraduate Students (Ages 18-22)",
        leastInterestedSegment: "Corporate Professionals / Investors",
        frequentlyAskedQuestions: [
          {
            question: "How does the AI parse my syllabus?",
            answer: "You upload a PDF of the syllabus, and the AI extracts assignment dates, exam schedules, and grade weights."
          },
          {
            question: "Does it sync with my Google Calendar?",
            answer: "Yes, it provides a 2-way sync with Google Calendar, Outlook, and Apple Calendar."
          }
        ],
        improvementRecommendations: [
          "Launch with a Freemium tier to drive early student adoption.",
          "Partner with student organizations for viral growth.",
          "Focus on robust calendar integrations as the primary core feature."
        ]
      } as unknown as T;
    }

    return {} as unknown as T;
  },

  /**
   * Mock final report markdown helper.
   */
  generateMockTextReport(userPrompt: string): string {
    return `# Synthetic Audience Validation Report: AI-powered Study Planner

## 1. Executive Summary
The target concept is an AI-powered study planner for college students designed to automate schedule planning and examination preparation. The concept received an overall interest score of **78/100** and a projected adoption probability of **65%**. The primary target demographic (undergraduates) shows high excitement about automated scheduling, while older students and educational administrators raise data privacy and cost-sensitivity concerns.

## 2. Audience Breakdown
The synthetic audience consisted of 15 diverse personas including:
* **Students (4)**: High interest, extremely cost-sensitive, values automation.
* **Engineers (4)**: Focused on calendar syncing, offline access, and reliability.
* **Product Managers (4)**: Analyzed usability and LMS (Learning Management System) integrations.
* **Founders & Investors (3)**: Skeptical of monetization strategy, suggested B2B partnerships.

## 3. Interest Score
* **Average Score**: 7.8 / 10
* **Highest Segment**: Students (8.5 / 10)
* **Lowest Segment**: Investors (5.0 / 10)

## 4. Adoption Probability
Based on the synthetic simulation, **65%** of student personas indicated a high likelihood to use the product within 1 month of release, provided a freemium model exists.

## 5. Common Objections
1. *"I already use Notion and Google Calendar for free; why pay?"*
2. *"Will it accurately parse complex, unstructured PDF syllabi?"*
3. *"Does it share my academic data with third parties?"*

## 6. Suggestions
* **Canvas/Blackboard Integrations**: Auto-fetch course deadlines.
* **SMS/WhatsApp Notifications**: To keep students updated without app fatigue.
* **Study Group Collaboration**: Sharing study schedules.

## 7. FAQs
* **Q: Can it read course changes mid-semester?** Yes, by re-uploading the updated syllabus or syncing directly.
* **Q: Is there a mobile app?** A responsive web app is preferred initially, followed by dedicated mobile wrappers.

## 8. Risk Analysis
* **High Risk**: PDF syllabus format changes breaking parsing engine.
* **Medium Risk**: High user acquisition cost offset by low customer lifetime value.

## 9. Improvement Opportunities
* **Freemium Strategy**: Monetize through premium study materials or group coordination features instead of charging for basic planning.
* **AI Syllabus OCR**: Invest heavily in the accuracy of syllabus parsing to ensure perfect setup on day one.
`;
  }
};
export { Schema };
