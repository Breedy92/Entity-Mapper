
import React from 'react';

interface ScenarioToggleProps {
  isComparing: boolean;
  onToggle: (compare: boolean) => void;
  strategyName: string;
}

export const ScenarioToggle: React.FC<ScenarioToggleProps> = ({ isComparing, onToggle, strategyName }) => {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex p-1.5 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl ring-1 ring-slate-900/5 items-center">
      <div className="px-6 py-2 border-r border-slate-100 mr-2">
        <div className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-0.5">Active Strategy</div>
        <div className="text-[11px] font-black text-slate-900 truncate max-w-[150px]">{strategyName}</div>
      </div>
      <button
        onClick={() => onToggle(false)}
        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
          !isComparing
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        Strategy View
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
          isComparing
            ? 'bg-slate-900 text-white shadow-lg'
            : 'text-slate-400 hover:text-indigo-500'
        }`}
      >
        Compare to Existing
      </button>
    </div>
  );
};
