
import React, { useState } from 'react';
import { generateStructureFromPrompt } from '../services/geminiService';
import { MapData } from '../types';

interface AIGeneratorProps {
  onGenerated: (data: MapData) => void;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({ onGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const data = await generateStructureFromPrompt(prompt);
    if (data) onGenerated(data);
    setLoading(false);
    setPrompt('');
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-[100]">
      <div className="bg-white/80 backdrop-blur-2xl p-2.5 rounded-3xl shadow-2xl border border-slate-200 flex gap-3 ring-1 ring-slate-200 group focus-within:ring-indigo-500/30 transition-all duration-500">
        <div className="flex-1 flex items-center px-4 gap-3">
          <svg className={`w-5 h-5 ${loading ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the structure (e.g. 'Add a family trust for the Smiths')"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 font-bold text-slate-800 tracking-tight"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${loading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
        >
          {loading ? 'Synthesizing...' : 'Generate structure'}
        </button>
      </div>
    </div>
  );
};
