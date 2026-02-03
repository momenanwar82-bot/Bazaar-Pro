
import React, { useState } from 'react';

interface MobileSyncModalProps {
  onClose: () => void;
}

const MobileSyncModal: React.FC<MobileSyncModalProps> = ({ onClose }) => {
  const currentUrl = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&bgcolor=0f172a&color=6366f1`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-sm rounded-[50px] border border-white/10 p-10 shadow-2xl text-center relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-600/20 blur-[80px] rounded-full"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Bazaar Mobile</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Scan or type the link below</p>
          </div>

          <div className="bg-white p-4 rounded-[40px] inline-block shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 break-all">
              <p className="text-[10px] text-indigo-400 font-mono mb-2 uppercase tracking-widest font-black">Current Live URL:</p>
              <div className="text-xs text-white font-medium select-all leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5">
                {currentUrl}
              </div>
            </div>
            
            <button 
              onClick={handleCopy}
              className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                copied ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              {copied ? 'LINK COPIED!' : 'COPY LINK TO CLIPBOARD'}
            </button>
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/10 rounded-full border border-indigo-500/20">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Live Session Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSyncModal;
