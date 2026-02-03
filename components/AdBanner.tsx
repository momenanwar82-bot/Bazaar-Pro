
import React from 'react';

interface AdBannerProps {
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ className = "" }) => {
  return (
    <div className={`adsense-banner-slot h-[100px] sm:h-[160px] bg-slate-900/40 rounded-[40px] border border-dashed border-indigo-500/20 flex flex-col items-center justify-center p-4 text-center group overflow-hidden relative shadow-2xl ${className}`}>
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2500ms] ease-in-out"></div>
      
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-center gap-3">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Global Ad Network</span>
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping delay-500"></span>
        </div>
        <div className="text-sm sm:text-lg font-black text-white uppercase tracking-tighter group-hover:scale-105 transition-transform duration-500">
          Boost Your Sales with <span className="text-indigo-500">Bazaar Premium</span>
        </div>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Verified listings reach 10x more buyers</p>
      </div>

      {/* Modern Accents */}
      <div className="absolute top-6 left-6 w-3 h-3 border-t-2 border-l-2 border-indigo-500/20 rounded-tl-md"></div>
      <div className="absolute bottom-6 right-6 w-3 h-3 border-b-2 border-r-2 border-indigo-500/20 rounded-br-md"></div>
    </div>
  );
};

export default AdBanner;
