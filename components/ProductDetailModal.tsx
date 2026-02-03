
import React, { useState, useEffect } from 'react';
import { Product, Currency } from '../types';
import { negotiatePrice, getProductReviews, addProductReview } from '../services/geminiService';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onViewProfile: (sellerName: string) => void;
  currency: Currency;
  currentUserEmail?: string;
  currentUserName?: string;
  onDeleteProduct?: (productId: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error') => void;
  onStartChat?: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  onClose, 
  isWishlisted = false, 
  onToggleWishlist,
  onViewProfile,
  currency,
  currentUserEmail,
  currentUserName,
  onDeleteProduct,
  onShowToast,
  onStartChat
}) => {
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [negotiationResult, setNegotiationResult] = useState<{status: string, message: string} | null>(null);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const convertedPrice = Math.round(product.price * currency.rate);
  const isOwner = currentUserEmail === product.sellerEmail;

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    const data = await getProductReviews(product.id);
    setReviews(data);
    setLoadingReviews(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserEmail) {
      onShowToast?.("Please log in to review", "error");
      return;
    }
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    const result = await addProductReview(product.id, reviewRating, currentUserName || 'Bazzarian', reviewComment);
    if (result) {
      onShowToast?.("Review submitted!", "success");
      await fetchReviews();
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
    } else {
      onShowToast?.("Failed to submit review", "error");
    }
    setIsSubmittingReview(false);
  };

  const renderStars = (rating: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setReviewRating(s)}
          className={`${interactive ? 'hover:scale-125 transition-transform' : ''}`}
        >
          <svg 
            className={`w-4 h-4 ${s <= rating ? 'text-yellow-400 fill-current' : 'text-slate-700'}`} 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-4xl h-full sm:h-[92vh] sm:rounded-[40px] shadow-2xl border border-white/5 overflow-y-auto custom-scrollbar flex flex-col relative" dir="ltr">
        
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-30 w-full bg-slate-900/80 backdrop-blur-xl flex justify-end p-6 border-b border-white/5">
          <button onClick={onClose} className="p-3 rounded-full bg-slate-950/40 backdrop-blur-xl text-white border border-white/10 shadow-xl active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col">
          {/* Main Image Container */}
          <div className="relative aspect-[16/10] sm:aspect-[21/9] overflow-hidden bg-black/20">
            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-contain p-8" />
          </div>

          <div className="p-6 sm:p-10 space-y-12 text-left">
            {/* Title and Price */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
                    {product.category}
                  </span>
                  {(product.rating || 0) > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                      {renderStars(product.rating || 0)}
                      <span className="text-[10px] font-black text-yellow-400">{product.rating}</span>
                    </div>
                  )}
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white leading-none uppercase tracking-tighter mb-4">{product.title}</h2>
                <span className="text-3xl font-black text-indigo-400">{currency.symbol}{convertedPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-3xl border border-white/5">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                  {product.sellerName.charAt(0)}
                </div>
                <div>
                  <span className="text-white font-black text-sm uppercase block">{product.sellerName}</span>
                  <button onClick={() => onViewProfile(product.sellerName)} className="text-[10px] text-indigo-400 font-black uppercase tracking-widest hover:underline">View Merchant Profile</button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Specifications</h4>
               <div className="bg-slate-950/40 p-8 rounded-[40px] border border-white/5 shadow-inner">
                  <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">{product.description}</p>
               </div>
            </div>

            {/* Ratings & Reviews Section */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Client Reviews ({reviews.length})</h4>
                <button 
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  {showReviewForm ? 'CANCEL' : 'RATE THIS PRODUCT'}
                </button>
              </div>

              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="bg-slate-950/60 p-6 rounded-[32px] border border-indigo-500/20 space-y-4 animate-in slide-in-from-top duration-300">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Stars</span>
                    <div className="scale-150 py-2">
                      {renderStars(reviewRating, true)}
                    </div>
                  </div>
                  <textarea 
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-600/40 h-28 resize-none"
                  />
                  <button 
                    disabled={isSubmittingReview}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-500 transition-all disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'SUBMITTING...' : 'POST REVIEW'}
                  </button>
                </form>
              )}

              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {loadingReviews ? (
                  <div className="py-10 text-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[28px] space-y-3 hover:bg-white/[0.04] transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-400">{rev.userName.charAt(0)}</div>
                          <div>
                            <span className="text-white text-xs font-black uppercase block">{rev.userName}</span>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">{new Date(rev.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {renderStars(rev.rating)}
                      </div>
                      <p className="text-slate-400 text-xs italic leading-relaxed">"{rev.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-20 border border-dashed border-white/10 rounded-[32px]">
                    <p className="text-[10px] font-black uppercase tracking-widest">No reviews yet for this listing</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-10 pb-20 border-t border-white/5">
               <div className="flex flex-col sm:flex-row gap-4">
                  {isOwner ? (
                    <button onClick={() => onDeleteProduct?.(product.id)} className="flex-1 py-6 bg-red-600/10 text-red-500 rounded-[28px] font-black text-xs border border-red-500/20 uppercase tracking-[0.2em]">REMOVE THIS LISTING</button>
                  ) : (
                    <>
                      <button 
                        onClick={() => onStartChat?.(product)} 
                        className="flex-1 py-6 bg-indigo-600 text-white rounded-[28px] font-black text-[11px] hover:bg-indigo-500 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        CHAT WITH SELLER
                      </button>
                      <button onClick={() => setShowNegotiation(true)} className="flex-1 py-6 bg-slate-800 text-white rounded-[28px] font-black text-[11px] border border-slate-700 hover:bg-slate-700 transition-all uppercase tracking-widest">NEGOTIATE PRICE</button>
                    </>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* Negotiation Modal */}
        {showNegotiation && (
          <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-[40px] border border-white/5 animate-in zoom-in">
              <h3 className="text-xl font-black text-white text-center mb-6 uppercase tracking-widest">SUBMIT AN OFFER</h3>
              {!negotiationResult ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setIsNegotiating(true);
                  negotiatePrice(product.title, product.price, Number(offerPrice) / currency.rate).then(res => {
                    setNegotiationResult(res);
                    setIsNegotiating(false);
                  });
                }} className="space-y-5">
                  <input type="number" placeholder="0" className="w-full py-6 bg-slate-800 border border-white/5 rounded-3xl text-white text-3xl font-black text-center outline-none" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
                  <button disabled={isNegotiating} className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest">{isNegotiating ? 'COMMUNICATING...' : 'SEND OFFER'}</button>
                  <button type="button" onClick={() => setShowNegotiation(false)} className="w-full text-slate-500 text-[10px] font-black uppercase text-center">CANCEL</button>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="p-8 rounded-[32px] bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                    <p className="text-sm font-bold italic">"{negotiationResult.message}"</p>
                  </div>
                  <button onClick={() => {setShowNegotiation(false); setNegotiationResult(null);}} className="w-full py-5 bg-slate-800 text-white rounded-[24px] font-black uppercase tracking-widest">DISMISS</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailModal;
