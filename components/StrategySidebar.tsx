
import React from 'react';
import { Strategy } from '../types';

interface StrategySidebarProps {
  strategies: Strategy[];
  activeStrategyId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string | null) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export const StrategySidebar: React.FC<StrategySidebarProps> = ({
  strategies,
  activeStrategyId,
  isOpen,
  onToggle,
  onSelect,
  onAdd,
  onDelete
}) => {
  return (
    <>
      {/* Tab Trigger */}
      <button
        onClick={onToggle}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-[60] bg-slate-900 text-white px-3 py-10 rounded-l-3xl shadow-2xl transition-all duration-500 hover:pr-5 group ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0'}`}
      >
        <div className="[writing-mode:vertical-lr] rotate-180 flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap opacity-60">Strategy Builder</span>
          <span className="text-lg group-hover:scale-125 transition-transform">✨</span>
        </div>
      </button>

      {/* Sidebar Content */}
      <div className={`fixed right-0 top-0 h-full bg-white border-l border-slate-200 z-[70] transition-all duration-500 ease-out shadow-[-20px_0_50px_rgba(0,0,0,0.05)] flex flex-col ${isOpen ? 'w-[360px]' : 'w-0 overflow-hidden'}`}>
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Strategies</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Scenario Planning</p>
          </div>
          <button onClick={onToggle} className="text-slate-300 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Baseline Option */}
          <button
            onClick={() => onSelect(null)}
            className={`w-full p-5 rounded-[2rem] text-left transition-all border-2 flex items-center gap-4 ${activeStrategyId === null ? 'border-slate-900 bg-slate-900 text-white shadow-xl scale-[1.02]' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
          >
            <div className={`p-2.5 rounded-xl ${activeStrategyId === null ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Reference</div>
              <div className="font-bold text-sm">Existing Structure</div>
            </div>
          </button>

          <div className="pt-6">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Proposals</span>
              <button onClick={onAdd} className="text-indigo-600 hover:text-indigo-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                New Strategy
              </button>
            </div>

            <div className="space-y-3">
              {strategies.map(s => (
                <div key={s.id} className="relative group">
                  <button
                    onClick={() => onSelect(s.id)}
                    className={`w-full p-5 rounded-[2rem] text-left transition-all border-2 flex items-center gap-4 ${activeStrategyId === s.id ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                  >
                    <div className={`p-2.5 rounded-xl ${activeStrategyId === s.id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-400'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Proposed</div>
                      <div className="font-bold text-sm truncate">{s.name}</div>
                    </div>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                    className="absolute -top-1 -right-1 p-1.5 bg-white border border-slate-100 rounded-full text-slate-300 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {strategies.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">No strategies created yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
