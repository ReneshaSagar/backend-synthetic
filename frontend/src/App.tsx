import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { SimulationView } from './components/SimulationView';
import { ReportDashboard } from './components/ReportDashboard';
import { Moon, Sun } from 'lucide-react';
import { 
  analyzeIdea, generateAudience, simulate, generateReport, 
  type IdeaAnalysis, type Persona, type Simulation, type Report 
} from './services/api';

type AppState = 'landing' | 'simulation' | 'report';
type SimStatus = 'analyzing' | 'generating' | 'simulating' | 'done';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [simStatus, setSimStatus] = useState<SimStatus>('analyzing');
  
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [report, setReport] = useState<Report | null>(null);

  // Dark mode state
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference on load
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDark(!isDark);
  };

  const startSimulationProcess = async (idea: string) => {
    try {
      setAppState('simulation');
      
      // Step 1: Analyze Idea
      setSimStatus('analyzing');
      const analysisResult = await analyzeIdea(idea);
      setAnalysis(analysisResult.analysis);
      const ideaId = analysisResult.ideaId;

      // Step 2: Generate Audience
      setSimStatus('generating');
      const audienceResult = await generateAudience(ideaId);
      setPersonas(audienceResult.personas);

      // Step 3: Simulate Reactions
      setSimStatus('simulating');
      const simResult = await simulate(ideaId);
      setSimulations(simResult.simulations);

      // Step 4: Generate Report
      setSimStatus('done');
      const reportResult = await generateReport(ideaId);
      setReport(reportResult.report);

      // Wait a moment for users to see the "done" state and thoughts, then show report
      setTimeout(() => {
        setAppState('report');
      }, 5000);

    } catch (error) {
      console.error('Error during simulation pipeline:', error);
      alert('An error occurred during the simulation. Please make sure the backend is running and Gemini API key is configured properly.');
      setAppState('landing');
    }
  };

  const restart = () => {
    setAppState('landing');
    setAnalysis(null);
    setPersonas([]);
    setSimulations([]);
    setReport(null);
  };

  return (
    <div className="min-h-screen bg-framer-bg dark:bg-[#050505] transition-colors duration-500">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] shadow-sm hover:shadow-md dark:text-white transition-all"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {appState === 'landing' && (
        <LandingPage onSubmitIdea={startSimulationProcess} />
      )}
      
      {appState === 'simulation' && (
        <SimulationView 
          status={simStatus} 
          analysis={analysis}
          personas={personas} 
          simulations={simulations} 
        />
      )}
      
      {appState === 'report' && report && (
        <ReportDashboard 
          report={report} 
          analysis={analysis}
          onRestart={restart} 
        />
      )}
    </div>
  );
}

export default App;
