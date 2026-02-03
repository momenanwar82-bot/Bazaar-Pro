
import React, { useState, useEffect, useRef } from 'react';
import { Product, Currency, SellerNotification } from '../types';
import { getSellerStats } from '../services/geminiService';
import ProductCard from './ProductCard';
import AdBanner from './AdBanner';

interface UserSummaryModalProps {
  user: { name: string; email: string };
  userProducts: Product[];
  wishlistedProducts: Product[];
  notifications: SellerNotification[];
  onClose: () => void;
  onLogout: () => void;
  onProductClick: (product: Product) => void;
  currency: Currency;
  onDeleteProduct: (productId: string) => void;
  onClearNotification: (id: string) => void;
  onRefresh: () => Promise<void>;
  initialTab?: 'listings' | 'saved' | 'alerts';
  currentUserEmail?: string;
  remainingAds: number;
}

const UserSummaryModal: React.FC<UserSummaryModalProps> = ({ 
  user, 
  userProducts, 
  wishlistedProducts,
  onClose, 
  onLogout, 
  onProductClick,
  currency,
  onDeleteProduct,
  initialTab = 'listings',
  currentUserEmail
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'alerts'>(initialTab);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stats, setStats] = useState<{ rating: number; reviewsCount: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    const fetchData = async () => {
      const data = await getSellerStats(user.name);
      setStats(data);
    };
    fetchData();
  }, [initialTab, user.name]);

  const handleDeleteWithAnimation = (productId: string) => {
    setDeletingId(productId);
    onDeleteProduct(productId);
    setTimeout(() => setDeletingId(null), 500);
  };

  const renderProductGrid = (products: Product[], isOwnerMode: boolean) => (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 pb-32">
      {products.map((p) => (
        <div 
          key={p.id} 
          className={`relative transition-all duration-500 ease-in-out ${deletingId === p.id ? 'opacity-0 scale-90 -translate-y-4' : 'opacity-100 scale-100'}`}
        >
          <ProductCard 
            product={p} 
            onClick={() => onProductClick(p)} 
            currency={currency}
            currentUserEmail={currentUserEmail}
            onDelete={handleDeleteWithAnimation}
            showDeleteButton={isOwnerMode} 
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
      <div 
        ref={scrollContainerRef}
        className="bg-slate-900/40 backdrop-blur-3xl w-full max-w-2xl sm:rounded-[60px] shadow-2xl border border-white/10 h-full sm:h-auto sm:max-h-[94vh] flex flex-col relative custom-scrollbar scroll-smooth overflow-y-auto"
      >
        <div className="relative h-64 bg-gradient-to-br from-indigo-600/60 via-indigo-900/70 to-slate-950/90 shrink-0 flex items-end justify-center border-b border-white/5">
          <button onClick={onLogout} className="absolute top-8 left-8 z-[150] p-4 bg-red-600/20 rounded-2xl text-red-500 border border-red-500/30 active:scale-90 shadow-2xl">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <button onClick={onClose} className="absolute top-8 right-8 z-[150] p-4 bg-white/10 rounded-full text-white border border-white/20 active:scale-90 shadow-2xl">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="w-32 h-32 bg-slate-900 rounded-[45px] border-[8px] border-slate-900 flex items-center justify-center translate-y-16 shadow-2xl z-[120]">
            <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-5xl font-black uppercase">{user.name.charAt(0)}</div>
          </div>
        </div>
        
        <div className="px-8 mt-24 text-center shrink-0">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{user.name}</h2>
          <div className="mt-8 bg-slate-950/40 rounded-[40px] p-6 border border-white/5">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="text-4xl font-black text-white">{stats?.rating || '0.0'}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Merchant Rating</div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-indigo-400">{userProducts.length}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Total Listings</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-[110] px-8 py-6 bg-slate-900/90 backdrop-blur-3xl border-b border-white/5 mt-12 flex gap-4">
            <button 
              onClick={() => setActiveTab('listings')} 
              className={`flex-1 py-4 rounded-[25px] text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeTab === 'listings' ? 'bg-white text-black border-white shadow-lg' : 'bg-slate-800/40 text-slate-500 border-white/5'
              }`}
            >
              MY ADS ({userProducts.length})
            </button>
            <button 
              onClick={() => setActiveTab('saved')} 
              className={`flex-1 py-4 rounded-[25px] text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeTab === 'saved' ? 'bg-white text-black border-white shadow-lg' : 'bg-slate-800/40 text-slate-500 border-white/5'
              }`}
            >
              SAVED ({wishlistedProducts.length})
            </button>
        </div>

        <div className="p-8 space-y-8">
            <AdBanner />

            {activeTab === 'listings' ? (
                userProducts.length > 0 ? renderProductGrid(userProducts, true) : (
                    <div className="py-24 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.4em]">No active listings</div>
                )
            ) : (
                wishlistedProducts.length > 0 ? renderProductGrid(wishlistedProducts, false) : (
                    <div className="py-24 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.4em]">Collection is empty</div>
                )
            )}
        </div>
      </div>
    </div>
  );
};

export default UserSummaryModal;
