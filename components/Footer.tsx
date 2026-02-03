
import React from 'react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
  onOpenSell: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms, onOpenContact, onOpenSell }) => {
  return (
    <footer className="bg-slate-950 border-t border-white/5 py-12 sm:py-20 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-xl font-black text-white uppercase tracking-tight">Bazaar</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              The premium global marketplace for verified sellers. Buy and sell cars, electronics, and lifestyle items with secure in-app live chat.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Marketplace</h4>
            <ul className="space-y-4">
              <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-slate-500 hover:text-indigo-400 text-sm font-medium transition-colors">Browse Products</button></li>
              <li><button onClick={onOpenSell} className="text-slate-500 hover:text-indigo-400 text-sm font-medium transition-colors">Post an Ad</button></li>
              <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-slate-500 hover:text-indigo-400 text-sm font-medium transition-colors">Categories</button></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Support</h4>
            <ul className="space-y-4">
              <li><button onClick={onOpenContact} className="text-slate-500 hover:text-indigo-400 text-sm font-medium transition-colors">Contact Us</button></li>
              <li><button onClick={onOpenPrivacy} className="text-slate-500 hover:text-indigo-400 text-sm font-medium transition-colors">Privacy Policy</button></li>
              <li><button onClick={onOpenTerms} className="text-slate-500 hover:text-indigo-400 text-sm font-medium transition-colors">Terms of Service</button></li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-xs text-slate-600 font-bold uppercase tracking-widest mb-1">Email</span>
                <span className="text-slate-400 text-sm font-bold">momen_anwar_82@gmail.com</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-600 font-bold uppercase tracking-widest mb-1">Support Phone</span>
                <span className="text-slate-400 text-sm font-bold">+20 121 287 7847</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-16 sm:mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.25em]">
            © 2026 BAZAAR GLOBAL. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Designed for Excellence</span>
            <span className="text-[10px] text-indigo-900 font-bold uppercase tracking-widest">Powered by Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
