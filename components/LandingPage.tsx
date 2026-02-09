
import React from 'react';

interface LandingPageProps {
  onEnterSimulation?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterSimulation }) => {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center shadow-xl">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l9 4.5V17.5L12 22l-9-4.5V6.5z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <span className="text-xl font-black uppercase tracking-[0.2em] text-slate-900">Portal</span>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Welcome to the Client Portal
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Please use the unique link provided by your advisor to access your structure map and documentation.
        </p>

        {/* Message Box */}
        <div className="mt-12 bg-white/50 border border-slate-200 rounded-[2.5rem] p-10 shadow-sm backdrop-blur-sm">
          <p className="text-slate-600 leading-relaxed text-lg">
            If you've received a link from your advisor, please click on it directly or paste it into your browser's address bar.
          </p>
          
          {/* Demo Action - Not in screenshot but useful for testing */}
          <button 
            onClick={onEnterSimulation}
            className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl"
          >
            Simulate Advisor Access
          </button>
        </div>

        {/* Footer Text */}
        <p className="mt-12 text-sm text-slate-400 font-bold tracking-tight">
          Need help? Contact your financial advisor for assistance.
        </p>
      </div>
    </div>
  );
};
