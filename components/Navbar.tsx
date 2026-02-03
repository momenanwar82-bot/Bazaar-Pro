
import React, { useState } from 'react';
import { Category, Currency, SellerNotification } from '../types';
import NotificationDropdown from './NotificationDropdown';
import MobileSyncModal from './MobileSyncModal';
import { CATEGORIES } from '../constants';

interface NavbarProps {
  onSearch: (query: string) => void;
  onOpenSellModal: () => void;
  user: { email: string; name: string } | null;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onLogout: () => void;
  wishlistCount: number;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onOpenNotifications: () => void;
  unreadChatsCount: number;
  unreadNotificationsCount: number;
  notifications: SellerNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onViewMyProfile: () => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  remainingAds: number;
  searchSuggestions?: string[];
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  onOpenChat: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSearch, 
  onOpenSellModal, 
  user, 
  onOpenLogin, 
  wishlistCount,
  showFavoritesOnly,
  onToggleFavorites,
  onOpenNotifications,
  unreadChatsCount,
  unreadNotificationsCount,
  notifications,
  onMarkAsRead,
  onClearAll,
  onViewMyProfile,
  searchSuggestions = [],
  selectedCategory,
  onSelectCategory,
  onOpenChat
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSyncModal, setShowSyncModal] = useState(false);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onSearch(val);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex flex-col w-full bg-black/60 backdrop-blur-3xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]">
        {/* Tier 1: Branding, Profile, Selling */}
        <div className="w-full h-16 px-4 sm:px-8 flex items-center justify-between border-b border-white/5">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white tracking-tighter uppercase leading-none group-hover:text-indigo-400 transition-colors">Bazaar</span>
              <span className="text-[6px] font-black text-indigo-500 tracking-[0.4em] uppercase opacity-80">PRO MARKET</span>
            </div>
          </div>

          {/* User & Sell */}
          <div className="flex items-center gap-3">
            {user ? (
              <button 
                onClick={onViewMyProfile} 
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-xs uppercase border border-white/10 active:scale-90 transition-all shadow-md backdrop-blur-md"
              >
                {user.name.charAt(0)}
              </button>
            ) : (
              <button onClick={onOpenLogin} className="px-4 py-2 bg-white/5 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all border border-white/5">Login</button>
            )}
            
            <button 
              onClick={onOpenSellModal} 
              className="px-6 py-2.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all shadow-lg active:scale-95 border border-white/20 backdrop-blur-md"
            >
              SELLING
            </button>
          </div>
        </div>

        {/* Tier 2: Action Icons (The "Crystal" Menu) */}
        <div className="w-full h-14 px-4 sm:px-8 flex items-center justify-center gap-7 sm:gap-12 bg-white/[0.03] backdrop-blur-2xl border-b border-white/5">
          {/* Search Icon */}
          <button 
            onClick={() => setIsSearchVisible(true)}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-white/10 transition-all">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Search</span>
          </button>

          {/* Notifications (Alerts) */}
          <div className="relative group flex flex-col items-center gap-1">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all relative"
            >
              <div className="p-1.5 rounded-lg group-hover:bg-white/10 transition-all">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border border-black shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>
              )}
              <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Alerts</span>
            </button>
            {showNotifMenu && (
              <NotificationDropdown 
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onClearAll={onClearAll}
                onViewAll={onOpenNotifications}
                onClose={() => setShowNotifMenu(false)}
              />
            )}
          </div>

          {/* Favorites (Saved) */}
          <button
            onClick={onToggleFavorites}
            className={`group flex flex-col items-center gap-1 transition-all ${
              showFavoritesOnly ? 'text-red-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all ${showFavoritesOnly ? 'bg-red-500/10' : 'group-hover:bg-white/10'}`}>
              <svg className={`h-5 w-5 ${showFavoritesOnly ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Saved</span>
          </button>

          {/* Mobile Sync */}
          <button 
            onClick={() => setShowSyncModal(true)}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-400 transition-all"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-indigo-400/10 transition-all">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 00-2 2z" />
              </svg>
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Sync</span>
          </button>

          {/* Chat Icon */}
          <button 
            onClick={onOpenChat}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-400 transition-all relative"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-indigo-400/10 transition-all">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            {unreadChatsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border border-black shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
            )}
            <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Chat</span>
          </button>
        </div>

        {/* Tier 3: Categories (Crystal List) */}
        <div className="w-full bg-white/[0.01] backdrop-blur-xl overflow-x-auto custom-scrollbar no-scrollbar border-b border-white/5">
          <div className="flex px-4 sm:px-8 min-w-max h-12 items-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`h-full px-5 text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center ${
                  selectedCategory === cat
                    ? 'text-indigo-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat}
                {selectedCategory === cat && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchVisible && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl z-[60] flex flex-col items-center justify-start pt-4 px-4 sm:px-8 animate-in fade-in slide-in-from-top duration-300">
            <div className="relative w-full max-w-2xl">
              <input
                autoFocus
                type="text"
                placeholder="SEARCH BAZAAR..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white font-black text-[11px] tracking-widest uppercase outline-none focus:ring-2 focus:ring-indigo-500/30 backdrop-blur-md"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button 
                onClick={() => { setIsSearchVisible(false); onSearch(''); setInputValue(''); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full text-slate-500 transition-all"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}
      </header>

      {showSyncModal && <MobileSyncModal onClose={() => setShowSyncModal(false)} />}
    </>
  );
};

export default Navbar;
