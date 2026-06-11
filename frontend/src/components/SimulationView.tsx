import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Persona, Simulation, IdeaAnalysis } from '../services/api';
import { Loader2, Check, ChevronDown } from 'lucide-react';

interface SimulationViewProps {
  status: 'analyzing' | 'generating' | 'simulating' | 'done';
  analysis: IdeaAnalysis | null;
  personas: Persona[];
  simulations: Simulation[];
}

// ==========================================
// PHASE 1: ANALYSIS & ASSEMBLY (Perplexity Style)
// ==========================================
const AnalysisPhase: React.FC<{ status: string, analysis: IdeaAnalysis | null }> = ({ status, analysis }) => {
  return (
    <motion.div 
      key="analysis-phase"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto bg-white/60 dark:bg-[#111]/60 backdrop-blur-xl border border-gray-200/50 dark:border-[#333]/50 rounded-[2rem] shadow-framer dark:shadow-2xl overflow-hidden transition-all duration-500"
    >
      <div className="p-12">
        <div className="flex items-center gap-4 mb-10">
          <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
          <h2 className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight">
            Synthesizing Audience...
          </h2>
        </div>

        <div className="space-y-6 text-base">
          
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {analysis ? (
                 <Check className="w-5 h-5 text-gray-400" />
              ) : (
                 <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              )}
            </div>
            <div>
              <p className={`font-medium ${analysis ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                Analyzing startup concept
              </p>
            </div>
          </div>

          {/* Step 2 (Shown when analysis is done) */}
          {analysis && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
              <div className="mt-1">
                 <Check className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-500 dark:text-gray-400">
                  Identifying target industry: <span className="text-gray-900 dark:text-white ml-1">{analysis.industry}</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3 (Generation) */}
          {(status === 'generating' || status === 'simulating' || status === 'done') && analysis && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
              <div className="mt-1">
                {status === 'generating' ? (
                   <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                   <Check className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className={`font-medium ${status === 'generating' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Generating 15 distinct demographic profiles
                </p>
              </div>
            </motion.div>
          )}

        </div>
      </div>
      
      {/* Footer expansion indicator (purely visual to match style) */}
      <div className="bg-white/30 dark:bg-black/30 backdrop-blur-sm border-t border-gray-200/50 dark:border-[#333]/50 px-12 py-4 flex justify-between items-center text-sm text-gray-500">
        <span>Reasoning process active</span>
        <ChevronDown className="w-5 h-5" />
      </div>
    </motion.div>
  );
};

// ==========================================
// PHASE 2: THE CANVAS
// ==========================================
const CanvasPhase: React.FC<{ personas: Persona[], simulations: Simulation[], status: string }> = ({ personas, simulations, status }) => {
  const [activePersonaIdx, setActivePersonaIdx] = useState<number>(-1);
  
  // Only visualize a subset of personas to avoid clutter
  const displayPersonas = personas.slice(0, 8);

  useEffect(() => {
    if (status === 'done' || (status === 'simulating' && simulations.length > 0)) {
      const interval = setInterval(() => {
        setActivePersonaIdx((prev) => (prev + 1) % displayPersonas.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [status, displayPersonas.length, simulations.length]);

  return (
    <motion.div 
      key="canvas-phase"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-5xl flex flex-col items-center"
    >
      <div className="z-10 text-center mb-8 space-y-4">
        <div className="inline-flex items-center justify-center gap-3 bg-white dark:bg-[#111] px-5 py-2.5 rounded-full shadow-sm border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors duration-500">
          {status !== 'done' && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
          <span>{status === 'simulating' ? 'Simulating persona reactions...' : 'Compiling insights report...'}</span>
        </div>
      </div>

      <div className="relative w-full h-[450px] border border-gray-200 dark:border-[#333] bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 flex flex-wrap content-center justify-center gap-6 transition-colors duration-500 overflow-hidden">
        {/* Very subtle dot grid */}
        <div className="absolute inset-0 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />

        <AnimatePresence>
          {displayPersonas.map((persona, idx) => {
            const isThinking = idx === activePersonaIdx && simulations.length > 0;
            const sim = simulations.find(s => s.personaId === persona.id);
            const hue = (persona.name.length * 40) % 360;

            return (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                className="relative z-10"
              >
                {/* Agent Avatar */}
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-out border-2
                    ${isThinking ? 'border-blue-500 shadow-md scale-105' : 'border-white dark:border-[#111]'}`}
                  style={{ backgroundColor: `hsl(${hue}, 70%, 90%)` }}
                >
                  <span className="text-sm font-semibold" style={{ color: `hsl(${hue}, 60%, 30%)` }}>
                    {persona.name.charAt(0)}
                  </span>
                </div>
                
                {/* Elegant Chat Bubble */}
                <AnimatePresence>
                  {isThinking && sim && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] shadow-lg p-4 rounded-2xl rounded-bl-sm z-50 pointer-events-none origin-bottom-left transition-colors duration-500"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{persona.name}</span>
                        <span className="text-[9px] font-medium text-gray-500 bg-gray-100 dark:bg-[#222] px-2 py-0.5 rounded-full uppercase tracking-wide">{persona.role}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-light">"{sim.reaction}"</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover Info */}
                <div className="absolute opacity-0 hover:opacity-100 transition-opacity duration-200 top-[calc(100%+8px)] left-1/2 -translate-x-1/2 min-w-[100px] bg-gray-900 dark:bg-white text-white dark:text-black shadow-md px-3 py-1.5 rounded-lg z-40 pointer-events-auto cursor-default text-center">
                  <span className="font-semibold block text-xs">{persona.name}</span>
                  <span className="block text-[9px] font-medium opacity-80 mt-0.5">{persona.role}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export const SimulationView: React.FC<SimulationViewProps> = ({ status, analysis, personas, simulations }) => {
  const isPhase1 = status === 'analyzing' || status === 'generating';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-framer-bg dark:bg-[#050505] transition-colors duration-500">
      <AnimatePresence mode="wait">
        {isPhase1 ? (
          <AnalysisPhase status={status} analysis={analysis} />
        ) : (
          <CanvasPhase personas={personas} simulations={simulations} status={status} />
        )}
      </AnimatePresence>
    </div>
  );
};
