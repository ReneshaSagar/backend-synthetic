import { StateGraph, START, END } from '@langchain/langgraph';
import { WorkflowState } from '../types';
import { dbService } from '../services/database';
import { analyzerAgent } from '../agents/analyzer';
import { generatorAgent } from '../agents/generator';
import { simulatorAgent } from '../agents/simulator';
import { insightsAgent } from '../agents/insights';
import { reporterAgent } from '../agents/reporter';

// Helper channel reducer - merges old state and new updates
const stateReducer = (left: any, right: any) => {
  return right !== undefined ? right : left;
};

// 1. Idea Analysis Node
async function analyzeIdeaNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('--- NODE: analyzeIdeaNode ---');
  if (!state.rawInput) {
    throw new Error('No raw input provided for analysis.');
  }

  const analysis = await analyzerAgent.analyzeIdea(state.rawInput);
  const savedIdea = await dbService.saveIdea(state.rawInput, analysis);

  return {
    ideaId: savedIdea.id,
    analyzedIdea: analysis
  };
}

// 2. Audience Generation Node
async function generateAudienceNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('--- NODE: generateAudienceNode ---');
  if (!state.ideaId || !state.analyzedIdea || !state.rawInput) {
    throw new Error('Missing idea information for audience generation.');
  }

  const personas = await generatorAgent.generateAudience(state.rawInput, state.analyzedIdea);
  const savedPersonas = await dbService.savePersonas(state.ideaId, personas);

  return {
    personas: savedPersonas
  };
}

// 3. Persona Simulation Node
async function simulateReactionsNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('--- NODE: simulateReactionsNode ---');
  if (!state.ideaId || !state.personas || !state.rawInput) {
    throw new Error('Missing personas or idea for simulation.');
  }

  const simulationResults = await simulatorAgent.simulateAudience(state.rawInput, state.personas);
  await dbService.saveSimulations(state.ideaId, simulationResults);
  const simulationsWithPersonas = await dbService.getSimulations(state.ideaId);

  return {
    simulations: simulationsWithPersonas
  };
}

// 4. Insight Generation Node
async function generateInsightsNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('--- NODE: generateInsightsNode ---');
  if (!state.rawInput || !state.simulations) {
    throw new Error('Missing simulations for insight generation.');
  }

  const insights = await insightsAgent.generateInsights(state.rawInput, state.simulations);

  return {
    insights
  };
}

// 5. Report Generation Node
async function generateReportNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('--- NODE: generateReportNode ---');
  if (!state.ideaId || !state.rawInput || !state.personas || !state.simulations || !state.insights) {
    throw new Error('Missing state data to generate report.');
  }

  const reportMarkdown = await reporterAgent.generateReport(
    state.rawInput,
    state.personas,
    state.simulations,
    state.insights
  );

  const savedReport = await dbService.saveReport(state.ideaId, state.insights, reportMarkdown);

  return {
    report: savedReport
  };
}

// Initialize StateGraph
const workflow = new StateGraph<WorkflowState>({
  channels: {
    ideaId: { value: stateReducer, default: () => undefined },
    rawInput: { value: stateReducer, default: () => undefined },
    analyzedIdea: { value: stateReducer, default: () => undefined },
    personas: { value: stateReducer, default: () => undefined },
    simulations: { value: stateReducer, default: () => undefined },
    insights: { value: stateReducer, default: () => undefined },
    report: { value: stateReducer, default: () => undefined }
  }
})
  .addNode('analyzeIdea', analyzeIdeaNode)
  .addNode('generateAudience', generateAudienceNode)
  .addNode('simulateReactions', simulateReactionsNode)
  .addNode('generateInsights', generateInsightsNode)
  .addNode('generateReport', generateReportNode)
  
  .addEdge(START, 'analyzeIdea')
  .addEdge('analyzeIdea', 'generateAudience')
  .addEdge('generateAudience', 'simulateReactions')
  .addEdge('simulateReactions', 'generateInsights')
  .addEdge('generateInsights', 'generateReport')
  .addEdge('generateReport', END);

// Compile the LangGraph workflow
export const compiledWorkflow = workflow.compile();
