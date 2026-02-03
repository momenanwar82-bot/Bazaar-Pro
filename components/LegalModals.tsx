
import React from 'react';

interface LegalModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalWrapper: React.FC<LegalModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div className="bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[85vh]">
      <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
        <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-8 overflow-y-auto custom-scrollbar text-slate-400 leading-relaxed text-sm">
        {children}
      </div>
    </div>
  </div>
);

export const TermsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper title="Terms & Conditions" onClose={onClose}>
    <div className="space-y-6">
      <section>
        <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">1. Listing Policies & Real-time Sync</h3>
        <p>Bazaar provides a real-time marketplace. When you publish an ad, it is synchronized instantly across all platforms. Conversely, <span className="text-indigo-400 font-bold">deleting an ad removes all traces</span> from our active database (Firebase) immediately. Each user is limited to <span className="text-white font-bold">2 listings per 24-hour cycle</span> to prevent spam and ensure quality.</p>
      </section>
      <section>
        <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">2. AI-Enhanced Quality Control</h3>
        <p>By using Bazaar, you agree that your product images may be processed by <span className="text-indigo-400 font-bold">Google Gemini AI</span> to automatically generate descriptions and ensure safety compliance. Ads that fail our automated quality gate (e.g., blurriness or unsafe content) may be restricted.</p>
      </section>
      <section>
        <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">3. Transactional Integrity</h3>
        <p>Bazaar acts as a facilitator. Users are responsible for verifying the condition of items before purchase. We prohibit the listing of illegal items, weapons, or counterfeit goods. Violations lead to permanent account suspension.</p>
      </section>
      <section>
        <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">4. Verified Merchant Status</h3>
        <p>Users who maintain a high rating (above 4.5) and have completed more than 50 successful listings are granted a "Verified Pro" badge, enhancing trust within the global community.</p>
      </section>
    </div>
  </ModalWrapper>
);

export const PrivacyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper title="Privacy Policy" onClose={onClose}>
    <div className="space-y-6">
      <section>
        <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">Data Collection & Storage</h3>
        <p>We collect your email, name, and phone number to facilitate secure buyer-seller connections. All user data and product information are stored using <span className="text-indigo-400 font-bold">Firebase Secure Cloud Storage</span>, ensuring encryption at rest and in transit.</p>
      </section>
      <section>
        <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">Gemini AI Image Analysis</h3>
        <p>Our platform uses <span className="text-indigo-400 font-bold">Vision AI (Gemini)</span> to analyze your product photos. This analysis is purely for identifying product categories and writing descriptions. We do not store biometric data or use your personal photos for AI training purposes.</p>
      </section>
      <section>
        <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">Communication Transparency</h3>
        <p>Your phone number is shared with potential buyers only when they click the "WhatsApp" button. We do not sell your personal contact info to third-party advertisers. For any privacy concerns, contact us at <span className="text-white font-bold">momen_anwar_82@gmail.com</span>.</p>
      </section>
      <section>
        <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">User Rights (GDPR/CCPA Ready)</h3>
        <p>You have the full right to access, modify, or <span className="text-red-500 font-bold">permanently delete your data</span>. Once you delete your account or an advertisement, it is immediately expunged from our real-time synchronization layer.</p>
      </section>
    </div>
  </ModalWrapper>
);

export const ContactModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper title="Contact Support" onClose={onClose}>
    <div className="space-y-8 text-center py-4">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-3xl flex items-center justify-center mb-4 border border-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight">Email Support</h3>
        <p className="text-indigo-400 font-bold mt-1">momen_anwar_82@gmail.com</p>
        <p className="text-slate-500 text-xs mt-2 max-w-xs mx-auto">Expect a professional response within 12-24 hours for all merchant inquiries.</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-3xl flex items-center justify-center mb-4 border border-emerald-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight">Technical Assistance</h3>
        <p className="text-emerald-400 font-bold mt-1">+20 121 287 7847</p>
        <p className="text-slate-500 text-xs mt-2">Available for direct WhatsApp or voice calls during GMT+2 business hours.</p>
      </div>
    </div>
  </ModalWrapper>
);
