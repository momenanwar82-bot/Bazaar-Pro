
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Category, Product, Currency, SellerNotification, Chat } from './types';
import { INITIAL_PRODUCTS, CURRENCIES, CATEGORIES } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import SellProductModal from './components/SellProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import LoginModal from './components/LoginModal';
import UserSummaryModal from './components/UserSummaryModal';
import UserProfileModal from './components/UserProfileModal';
import ChatManager from './components/ChatManager';
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
import { PrivacyModal, TermsModal, ContactModal } from './components/LegalModals';
import { 
  db, 
  auth,
  saveProductToDB, 
  deleteProductFromDB, 
  markNotificationAsRead,
  logoutUser,
  getUserUploadCountToday,
  subscribeToUserChats,
  getOrCreateChat
} from './services/geminiService';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, onSnapshot, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [viewingSellerName, setViewingSellerName] = useState<string | null>(null);
  const [summaryInitialTab, setSummaryInitialTab] = useState<'listings' | 'saved' | 'alerts'>('listings');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dbEmpty, setDbEmpty] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [remainingAds, setRemainingAds] = useState(0);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);

  // Swipe logic state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ email: firebaseUser.email || '', name: firebaseUser.displayName || 'User' });
      } else {
        setUser(null);
      }
      setIsInitialLoad(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      })) as Product[];
      setProducts(fetchedProducts);
      setDbEmpty(fetchedProducts.length === 0);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserChats([]);
      return;
    }
    const unsubscribe = subscribeToUserChats(user.email, (chats) => {
      setUserChats(chats);
    });
    return () => unsubscribe();
  }, [user]);

  // Swipe Navigation Logic
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = CATEGORIES.indexOf(selectedCategory);
      let nextIndex = currentIndex;

      if (isLeftSwipe) {
        nextIndex = (currentIndex + 1) % CATEGORIES.length;
      } else if (isRightSwipe) {
        nextIndex = (currentIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
      }

      setSelectedCategory(CATEGORIES[nextIndex]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartChat = async (product: Product) => {
    if (!user) return;
    if (user.email === product.sellerEmail) {
      showToast("لا يمكنك التحدث مع نفسك!", "error");
      return;
    }
    const chatId = await getOrCreateChat(
      product.id, 
      product.title, 
      product.imageUrl, 
      user.email, 
      product.sellerEmail || '', 
      product.sellerName,
      user.name
    );
    setActiveChatId(chatId);
    setIsChatOpen(true);
    setSelectedProduct(null);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setIsSummaryModalOpen(false);
    showToast("تم تسجيل الخروج");
  };

  const handleAddProduct = async (newProduct: Product) => {
    if (!user) return;
    try {
      const cleanData = {
        ...newProduct,
        sellerName: user.name,
        sellerEmail: user.email,
        rating: 0,
        reviewsCount: 0
      };
      await saveProductToDB(cleanData);
      showToast("تم نشر الإعلان بنجاح!");
      setIsSellModalOpen(false);
    } catch (err) {
      showToast("فشل النشر", "error");
    }
  };

  const handleViewMerchantProfile = (sellerName: string) => {
    setViewingSellerName(sellerName);
    setSelectedProduct(null); 
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = searchQuery === '' || p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFav = !showFavoritesOnly || wishlist.includes(p.id);
      return matchesCategory && matchesSearch && matchesFav;
    });
  }, [products, selectedCategory, searchQuery, showFavoritesOnly, wishlist]);

  if (isInitialLoad) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4"><LoginModal onClose={() => {}} onLogin={(e, n) => setUser({email: e, name: n})} hideCloseButton={true} initialMode="login" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col overflow-x-hidden">
      <Navbar 
        onSearch={setSearchQuery} 
        onOpenSellModal={() => setIsSellModalOpen(true)} 
        user={user}
        onOpenLogin={() => {}} 
        onOpenSignUp={() => {}} 
        onLogout={handleLogout}
        wishlistCount={wishlist.length} 
        showFavoritesOnly={showFavoritesOnly} 
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        onOpenNotifications={() => { setSummaryInitialTab('alerts'); setIsSummaryModalOpen(true); }}
        unreadChatsCount={userChats.filter(c => c.unread).length} 
        unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
        notifications={notifications}
        onMarkAsRead={markNotificationAsRead} 
        onClearAll={() => {}}
        onViewMyProfile={() => { setSummaryInitialTab('listings'); setIsSummaryModalOpen(true); }}
        selectedCurrency={selectedCurrency} 
        onCurrencyChange={setSelectedCurrency} 
        remainingAds={remainingAds}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenChat={() => setIsChatOpen(true)}
      />
      
      <main 
        className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative text-left"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
            {showFavoritesOnly ? 'My Favorites' : selectedCategory === 'All' ? 'Marketplace' : selectedCategory}
          </h1>
          <div className="flex sm:hidden items-center gap-2 opacity-20">
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} /></svg>
            <span className="text-[8px] font-black uppercase tracking-widest">Swipe Tabs</span>
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} /></svg>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredProducts.map((product, index) => (
              <React.Fragment key={product.id}>
                <ProductCard 
                  product={product} onClick={() => setSelectedProduct(product)}
                  isWishlisted={wishlist.includes(product.id)} onToggleWishlist={(e) => { e.stopPropagation(); const exists = wishlist.includes(product.id); setWishlist(prev => exists ? prev.filter(id => id !== product.id) : [...prev, product.id]); }}
                  currency={selectedCurrency} onShowToast={showToast} currentUserEmail={user.email} 
                  onStartChat={handleStartChat}
                />
                {(index + 1) % 4 === 0 && <div className="col-span-2 my-4"><AdBanner /></div>}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center opacity-20"><p className="font-black uppercase text-[10px] tracking-[0.4em]">No listings found in {selectedCategory}</p></div>
        )}

        {toast && <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl font-black text-[10px] uppercase tracking-widest ${toast.type === 'success' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-red-600/20 text-red-400 border-red-500/30'}`}>{toast.message}</div>}
      </main>

      <Footer onOpenPrivacy={() => setShowPrivacy(true)} onOpenTerms={() => setShowTerms(true)} onOpenContact={() => setShowContact(true)} onOpenSell={() => setIsSellModalOpen(true)} />

      {isSellModalOpen && <SellProductModal onClose={() => setIsSellModalOpen(false)} onAdd={handleAddProduct} userEmail={user.email} />}
      
      {selectedProduct && <ProductDetailModal 
        product={selectedProduct} onClose={() => setSelectedProduct(null)} 
        isWishlisted={wishlist.includes(selectedProduct.id)} onToggleWishlist={() => {}} 
        onViewProfile={handleViewMerchantProfile} currency={selectedCurrency} currentUserEmail={user.email} currentUserName={user.name} 
        onShowToast={showToast} onStartChat={handleStartChat}
      />}
      
      {isChatOpen && (
        <ChatManager 
          chats={userChats} 
          activeChatId={activeChatId} 
          onClose={() => setIsChatOpen(false)} 
          onSelectChat={setActiveChatId} 
          currentUserEmail={user.email} 
        />
      )}

      {isSummaryModalOpen && (
        <UserSummaryModal 
          user={user} userProducts={products.filter(p => p.sellerEmail === user.email)} 
          wishlistedProducts={products.filter(p => wishlist.includes(p.id))} 
          notifications={notifications} onClose={() => setIsSummaryModalOpen(false)} 
          onLogout={handleLogout} onProductClick={(p) => setSelectedProduct(p)} 
          currency={selectedCurrency} onDeleteProduct={() => {}} 
          onClearNotification={() => {}} onRefresh={async () => {}}
          initialTab={summaryInitialTab} currentUserEmail={user.email} remainingAds={remainingAds}
        />
      )}

      {viewingSellerName && (
        <UserProfileModal 
          sellerName={viewingSellerName}
          allProducts={products}
          onClose={() => setViewingSellerName(null)}
          onProductClick={(p) => { setViewingSellerName(null); setSelectedProduct(p); }}
          onStartChat={handleStartChat}
          currency={selectedCurrency}
        />
      )}
      
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  );
};

export default App;
