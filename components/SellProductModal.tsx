
import React, { useState, useRef, useEffect } from 'react';
import { Category, Product } from '../types';
import { CATEGORIES, COUNTRY_CODES } from '../constants';
import { generateProductDescription, analyzeImageSafety, identifyProductFromImage, getUserUploadCountToday } from '../services/geminiService';

interface SellProductModalProps {
  onClose: () => void;
  onAdd: (product: Product) => void;
  userEmail: string;
}

const SellProductModal: React.FC<SellProductModalProps> = ({ onClose, onAdd, userEmail }) => {
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [showCountrySearch, setShowCountrySearch] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  
  const [countryData, setCountryData] = useState(COUNTRY_CODES[0]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Others' as Category,
    price: '',
    location: '',
    phoneNumber: '',
    description: '',
    imageUrl: ''
  });

  const wordCount = formData.description.trim() === '' ? 0 : formData.description.trim().split(/\s+/).length;
  const isDescriptionShort = wordCount > 0 && wordCount < 10;

  // ضغط الصورة لضمان استجابة لحظية من Gemini ومنع تعليق المتصفح
  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 700; // حجم مثالي للرؤية
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // ضغط متوسط للسرعة
      };
    });
  };

  useEffect(() => {
    try {
      const locale = navigator.language || 'en-US';
      const region = locale.split('-')[1]?.toUpperCase();
      if (region) {
        const detectedCountry = COUNTRY_CODES.find(cc => cc.iso === region);
        if (detectedCountry) setCountryData(detectedCountry);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const checkLimit = async () => {
      setCheckingLimit(true);
      const count = await getUserUploadCountToday(userEmail);
      if (count >= 2) setLimitReached(true); 
      setCheckingLimit(false);
    };
    checkLimit();
  }, [userEmail]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnalyzingImage(true);
      setImageError('');
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const compressed = await compressImage(base64);
          
          // البدء في تحليل الصورة فوراً
          const safety = await analyzeImageSafety(compressed);
          if (!safety.isSafe) {
            setImageError('Image rejected for safety reasons.');
            setAnalyzingImage(false);
            return;
          }

          setFormData(prev => ({ ...prev, imageUrl: base64 }));

          // Vision AI: استخراج تفاصيل المنتج
          const info = await identifyProductFromImage(compressed);
          if (info) {
            setFormData(prev => ({
              ...prev,
              title: String(info.title || prev.title),
              category: (CATEGORIES.includes(info.category) ? info.category : 'Others') as Category,
              description: String(info.description || prev.description)
            }));
          }
        } catch (err) {
          setImageError("AI could not analyze this image. Please fill details manually.");
        } finally {
          setAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSmartDescribe = async () => {
    if (!formData.title) {
      setImageError('Enter title first.');
      return;
    }
    setLoading(true);
    try {
      const desc = await generateProductDescription(formData.title, formData.category, formData.description);
      setFormData(prev => ({ ...prev, description: desc }));
    } catch (err) {}
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limitReached) return;
    if (!formData.imageUrl) { setImageError('Upload photo first.'); return; }
    if (wordCount < 10) { setImageError('Description too short (min 10 words).'); return; }

    onAdd({
      id: String(Date.now()),
      ...formData,
      price: Number(formData.price),
      location: countryData.country,
      phoneNumber: `${countryData.code}${formData.phoneNumber.replace(/^0+/, '')}`,
      createdAt: new Date(),
      sellerName: 'Bazaar Merchant'
    } as any);
  };

  if (checkingLimit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/5 overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Post Your Ad</h2>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
               Vision AI Active
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 transition-all">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {limitReached ? (
          <div className="p-20 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-black text-white uppercase mb-2">Daily Limit Reached</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">You can post 2 ads per day. Please return tomorrow.</p>
            <button onClick={onClose} className="mt-8 px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs">Back to Market</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-left">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-64 w-full bg-slate-800 border-2 border-dashed ${imageError ? 'border-red-500/40' : 'border-white/5'} rounded-[32px] flex items-center justify-center cursor-pointer hover:border-indigo-500/40 transition-all overflow-hidden group shadow-inner`}
            >
              {analyzingImage ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Analyzing Visuals...</span>
                </div>
              ) : formData.imageUrl ? (
                <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="text-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <svg className="w-12 h-12 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={1.5}/></svg>
                  <p className="text-[10px] font-black uppercase tracking-widest">Select Product Photo</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                  <input required className="w-full px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <select className="w-full px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                    {CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat} value={cat} className="bg-slate-900">{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Price (USD)</label>
                  <input required type="number" className="w-full px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none" placeholder="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="px-4 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white text-xs font-black flex items-center">{countryData.flag} +{countryData.code}</div>
                    <input required className="flex-1 px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                  <button type="button" onClick={handleSmartDescribe} disabled={loading} className="text-[9px] text-indigo-400 font-black uppercase flex items-center gap-1 hover:text-indigo-300">
                    {loading ? <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div> : 'AI Rewrite'}
                  </button>
                </div>
                <textarea required className="w-full px-5 py-5 bg-slate-800/50 border border-white/5 rounded-3xl text-white text-sm min-h-[150px] outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            {imageError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase text-center">{imageError}</div>}

            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all active:scale-95">Publish Ad</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellProductModal;
