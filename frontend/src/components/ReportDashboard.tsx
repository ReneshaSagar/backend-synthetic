import React from 'react';
import type { Report, IdeaAnalysis } from '../services/api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, MessageSquareQuote } from 'lucide-react';

interface ReportDashboardProps {
  report: Report;
  analysis: IdeaAnalysis | null;
  onRestart: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ report, analysis, onRestart }) => {
  const scoreData = [
    { name: 'Interest', value: report.interestScore },
    { name: 'Remaining', value: 100 - report.interestScore }
  ];
  const COLORS = ['#3b82f6', '#f1f5f9']; // Soft blue and very light slate

  return (
    <div className="min-h-screen p-8 bg-framer-bg dark:bg-[#050505] text-framer-text dark:text-white selection:bg-blue-100 dark:selection:bg-blue-900/50 selection:text-blue-900 dark:selection:text-blue-100 font-['Outfit'] transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-12 pt-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border border-green-100 dark:border-green-900/50 transition-colors duration-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Analysis Complete
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white transition-colors duration-500">
              Simulation Insights
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-light transition-colors duration-500">
              Market reaction based on <span className="font-medium text-gray-800 dark:text-gray-200">{analysis?.industry || 'target'}</span> synthetic segment.
            </p>
          </div>
          <button 
            onClick={onRestart}
            className="px-8 py-4 bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#222] text-gray-900 dark:text-white border border-gray-200 dark:border-[#333] shadow-sm hover:shadow-md transition-all duration-300 rounded-full text-base font-medium flex items-center gap-2"
          >
            New Simulation <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Interest Score Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-framer dark:shadow-none hover:shadow-framer-hover transition-all rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative group"
          >
            <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest font-semibold mb-6 w-full text-left transition-colors duration-500">Interest Score</h3>
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-5xl font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-500">{report.interestScore}%</span>
              </div>
            </div>
          </motion.div>

          {/* Most Interested Group */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-framer dark:shadow-none hover:shadow-framer-hover transition-all rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden"
          >
             <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500">
                <CheckCircle2 className="w-6 h-6" />
             </div>
             <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest font-semibold mb-auto transition-colors duration-500">Key Segment</h3>
             <p className="text-3xl font-medium text-gray-900 dark:text-white mt-8 leading-tight transition-colors duration-500">
               {report.mostInterestedSegment}
             </p>
          </motion.div>

          {/* Top Concerns Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-framer dark:shadow-none hover:shadow-framer-hover transition-all rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden"
          >
             <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500">
                <AlertTriangle className="w-6 h-6" />
             </div>
             <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest font-semibold mb-auto transition-colors duration-500">Primary Friction</h3>
             <p className="text-2xl font-medium text-gray-900 dark:text-white mt-8 leading-tight line-clamp-3 transition-colors duration-500">
               {report.commonConcerns[0] || 'None identified'}
             </p>
          </motion.div>

        </div>

        {/* Detailed Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Common Concerns */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-sm dark:shadow-none hover:shadow-md transition-all rounded-[2.5rem] p-12"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-rose-500 dark:text-rose-400 transition-colors duration-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-500">Key Objections</h3>
            </div>
            <ul className="space-y-6">
              {report.commonConcerns.map((concern, idx) => (
                <li key={idx} className="flex gap-5 text-gray-600 dark:text-gray-300 transition-colors duration-500">
                  <span className="text-rose-400 dark:text-rose-500 font-medium mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                  <span className="leading-relaxed text-lg font-light">{concern}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Suggested Improvements */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-sm dark:shadow-none hover:shadow-md transition-all rounded-[2.5rem] p-12"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-500 dark:text-blue-400 transition-colors duration-500">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-500">Recommendations</h3>
            </div>
            <ul className="space-y-6">
              {report.suggestedImprovements.map((improvement, idx) => (
                <li key={idx} className="flex gap-5 text-gray-600 dark:text-gray-300 transition-colors duration-500">
                  <span className="text-blue-500 dark:text-blue-400 mt-1">→</span>
                  <span className="leading-relaxed text-lg font-light">{improvement}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* FAQs */}
        {report.faqs && report.faqs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-framer dark:shadow-none rounded-[3rem] p-12 transition-all duration-500"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-500 dark:text-indigo-400 transition-colors duration-500">
                <MessageSquareQuote className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-500">Audience Q&A</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {report.faqs.map((faq, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors duration-300 p-8 rounded-[2rem]">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg transition-colors duration-500">Q: {faq.question}</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light transition-colors duration-500">A: {faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
