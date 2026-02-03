
import React, { useState, useEffect } from 'react';
import { Product, Currency } from '../types';
import { getSellerStats } from '../services/geminiService';
import ProductCard from './ProductCard';

interface UserProfileModalProps {
  sellerName: string;
  allProducts: Product[];
  onClose: () => void;
  onProductClick: (product: Product) => void;
  onStartChat: (product: Product) => void;
  currency: Currency;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  sellerName, 
  allProducts, 
  onClose,
  onProductClick,
  onStartChat,
  currency
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    rating: number, 
    reviewsCount: number, 
    activeAds: number, 
    joinedDate: string 
  } | null>(null);

  const sellerProducts = allProducts.filter(p => p.sellerName === sellerName);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await getSellerStats(sellerName);
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, [sellerName]);

  const isVerified = (stats?.rating || 0) >= 4.5 && (stats?.reviewsCount || 0) >= 50;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center justify-center sm:justify-start gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-slate-700'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-slate-500 text-[10px] font-black ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-2xl min-h-full sm:min-h-0 sm:rounded-[50px] shadow-2xl border border-white/5 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header - Styled like user screenshot */}
        <div className="p-8 pb-10 border-b border-white/5 bg-slate-900/50 relative text-center sm:text-left">
          <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 transition-all z-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="flex flex-col items-center sm:items-start gap-6">
            <div className="flex flex-col items-center sm:flex-row gap-5">
              <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-900/40 border-4 border-slate-900">
                {sellerName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{sellerName}</h2>
                  {isVerified && (
                    <svg className="w-5 h-5 text-blue-500 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  )}
                </div>
                {renderStars(stats?.rating || 0)}
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-950/40 p-5 rounded-[28px] border border-white/5">
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Active Ads</div>
                <div className="text-2xl font-black text-white">{sellerProducts.length}</div>
              </div>
              <div className="bg-slate-950/40 p-5 rounded-[28px] border border-white/5">
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Joined Date</div>
                <div className="text-xl font-black text-slate-300">{loading ? '...' : stats?.joinedDate}</div>
              </div>
              <div className="col-span-2 bg-slate-950/40 p-5 rounded-[28px] border border-white/5 text-center">
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Total Reviews</div>
                <div className="text-3xl font-black text-indigo-400">{loading ? '...' : stats?.reviewsCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-950/20 custom-scrollbar">
          <div className="mb-6 flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Merchant Listings</h3>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{sellerProducts.length} Total</span>
          </div>

          {sellerProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
              {sellerProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => onProductClick(product)}
                  currency={currency}
                  onStartChat={onStartChat}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center opacity-20 border border-dashed border-white/10 rounded-[40px]">
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">No active listings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
