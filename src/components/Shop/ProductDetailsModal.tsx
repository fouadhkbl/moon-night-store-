
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Minus, Plus, ShoppingCart, Globe, Star, MessageSquare, Send, User, ThumbsUp, Lock, ArrowRight, Package } from 'lucide-react';
import { Product, Review, Profile } from '../../types';
import { supabase } from '../../supabaseClient';

export const ProductDetailsModal = ({ product, onClose, onAddToCart, onSwitchProduct }: { 
    product: Product, 
    onClose: () => void, 
    onAddToCart: (p: Product, qty: number) => void,
    onSwitchProduct: (p: Product) => void 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Scroll to top when product changes
      if (scrollRef.current) scrollRef.current.scrollTo(0, 0);

      const fetchData = async () => {
          setLoadingReviews(true);
          
          // 1. Fetch Reviews
          const { data: reviewData } = await supabase
            .from('reviews')
            .select('*, profile:profiles(*)')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false });
          
          if (reviewData) setReviews(reviewData);
          
          // 2. Fetch Related Products (Same Category, Not Current Item)
          const { data: relatedData } = await supabase
            .from('products')
            .select('*')
            .eq('category', product.category)
            .neq('id', product.id)
            .eq('is_hidden', false)
            .limit(3);
            
          if (relatedData) setRelatedProducts(relatedData);

          // 3. Check User & Purchase History
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
              if (profile) setCurrentUser(profile);

              if (profile && user.id !== 'guest-user-123') {
                  // Check if user bought this item AND order is completed
                  const { data: orders } = await supabase
                    .from('orders')
                    .select('id, status, order_items(product_id)')
                    .eq('user_id', user.id)
                    .eq('status', 'completed');
                  
                  // Flatten and check
                  const hasBought = orders?.some(o => 
                      o.order_items.some((item: any) => item.product_id === product.id)
                  );
                  
                  // Also check if they already reviewed it (optional: allow multiple? usually no)
                  const hasReviewed = reviewData?.some(r => r.user_id === user.id);
                  
                  setCanReview(!!hasBought && !hasReviewed);
              }
          }
          
          setLoadingReviews(false);
      };
      fetchData();
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser || submitting || !canReview) return;

      setSubmitting(true);
      const { data, error } = await supabase.from('reviews').insert({
          product_id: product.id,
          user_id: currentUser.id,
          rating: newRating,
          comment: newComment
      }).select('*, profile:profiles(*)').single();

      if (!error && data) {
          setReviews([data, ...reviews]);
          setNewComment('');
          setNewRating(5);
          setCanReview(false); // Disable after submitting
      }
      setSubmitting(false);
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 'New';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1e232e] w-full max-w-5xl rounded-[2rem] overflow-hidden shadow-2xl border border-gray-800 relative animate-slide-up max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors backdrop-blur-md border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div ref={scrollRef} className="overflow-y-auto custom-scrollbar flex-1 bg-[#1e232e]">
            
            {/* TOP SECTION: Image & Info */}
            <div className="flex flex-col md:flex-row border-b border-gray-800">
               {/* Left: Image */}
               <div className="w-full md:w-5/12 bg-[#0b0e14] relative min-h-[300px] flex items-center justify-center p-8 group">
                   <img 
                    src={product.image_url} 
                    className="w-full max-h-[300px] object-contain transition-transform duration-500 group-hover:scale-105" 
                    alt="" 
                    onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        if (product.image_url_2 && target.src !== product.image_url_2) {
                            target.src = product.image_url_2;
                        } else {
                            target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
                        }
                    }}
                   />
                   <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                       <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                       <span className="text-xs font-bold text-white">{averageRating}</span>
                       <span className="text-[10px] text-gray-400 ml-1">({reviews.length} Reviews)</span>
                   </div>
               </div>

               {/* Right: Product Info */}
               <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className="px-3 py-1 rounded-lg bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                            {product.category}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            {product.platform}
                        </span>
                        {product.country && (
                            <span className="px-3 py-1 rounded-lg bg-green-900/10 text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-green-500/20">
                                <Globe className="w-3 h-3" /> {product.country}
                            </span>
                        )}
                    </div>

                    <h2 className="text-3xl font-black text-white italic mb-4 uppercase tracking-tighter leading-none">{product.name}</h2>
                    
                    <div className="bg-[#0b0e14] rounded-2xl p-4 border border-gray-800 mb-6">
                        <p className="text-gray-400 text-xs leading-relaxed font-medium">
                            {product.description || "Instant delivery. Secure transaction. Verified seller."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div>
                         <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Price</p>
                         <p className="text-3xl font-black text-yellow-400 italic tracking-tighter">{product.price.toFixed(2)} DH</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Status</p>
                         <p className="text-sm font-black text-green-400 flex items-center gap-2 uppercase tracking-widest mt-1 bg-green-900/10 w-fit px-3 py-1 rounded-lg border border-green-500/20">
                           <Zap className="w-4 h-4 fill-green-400" /> Instant
                         </p>
                       </div>
                    </div>

                    <div className="mt-auto space-y-4">
                       <div className="flex items-center justify-between bg-[#0b0e14] p-3 rounded-2xl border border-gray-800">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Quantity</span>
                          <div className="flex items-center gap-4">
                             <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition">
                               <Minus className="w-4 h-4" />
                             </button>
                             <span className="text-lg font-black text-white w-6 text-center">{quantity}</span>
                             <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition">
                               <Plus className="w-4 h-4" />
                             </button>
                          </div>
                       </div>

                       <button 
                         onClick={() => { onAddToCart(product, quantity); onClose(); }}
                         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs"
                       >
                         <ShoppingCart className="w-5 h-5" /> Add to Cart — {(product.price * quantity).toFixed(2)} DH
                       </button>
                    </div>
               </div>
            </div>

            {/* MIDDLE SECTION: Related Products (Cross Sell) */}
            {relatedProducts.length > 0 && (
                <div className="p-6 md:p-10 border-b border-gray-800 bg-[#11151c]">
                    <h3 className="text-white font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2 text-lg">
                        <Package className="w-5 h-5 text-purple-500" /> You Might Also Like
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedProducts.map(rel => (
                            <div 
                                key={rel.id} 
                                onClick={() => onSwitchProduct(rel)} 
                                className="bg-[#1e232e] p-4 rounded-2xl border border-gray-800 flex gap-3 items-center group cursor-pointer hover:border-purple-500/50 transition-all opacity-80 hover:opacity-100"
                            >
                                <img src={rel.image_url} className="w-12 h-12 rounded-lg object-cover bg-black" alt=""/>
                                <div className="min-w-0">
                                    <p className="text-white font-bold text-xs truncate uppercase tracking-tight">{rel.name}</p>
                                    <p className="text-yellow-400 font-black italic text-xs">{rel.price.toFixed(2)} DH</p>
                                </div>
                                <button className="ml-auto bg-[#0b0e14] p-2 rounded-lg text-gray-400 hover:text-white group-hover:bg-purple-600 group-hover:text-white transition-all">
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BOTTOM SECTION: Reviews */}
            <div className="bg-[#151a23] p-6 md:p-10">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-2">
                   <MessageSquare className="w-5 h-5 text-blue-500" /> Customer Reviews
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left: Review Form (4 cols) */}
                    <div className="md:col-span-4">
                        <div className="bg-[#1e232e] p-6 rounded-2xl border border-gray-800 sticky top-4">
                            {currentUser && canReview ? (
                                <form onSubmit={handleSubmitReview}>
                                    <p className="text-white font-bold text-sm mb-4">Rate your purchase</p>
                                    <div className="flex gap-2 mb-4">
                                        {[1,2,3,4,5].map(star => (
                                            <button 
                                                key={star} 
                                                type="button"
                                                onClick={() => setNewRating(star)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star className={`w-6 h-6 ${star <= newRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea 
                                        className="w-full bg-[#0b0e14] border border-gray-700 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none mb-4 h-24 resize-none"
                                        placeholder="Share your experience..."
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        required
                                    />
                                    <button disabled={submitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                        {submitting ? 'Posting...' : 'Post Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-8 px-4">
                                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                        <Lock className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <p className="text-white text-xs font-black uppercase tracking-widest mb-2">Verified Owners Only</p>
                                    <p className="text-gray-500 text-[10px] font-medium leading-relaxed">
                                        {currentUser ? "You must purchase and receive this item to leave a review." : "Please log in and purchase this item to share your thoughts."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Reviews List (8 cols) */}
                    <div className="md:col-span-8 space-y-4">
                        {loadingReviews ? (
                            <div className="text-center py-10 text-gray-500 font-bold text-xs uppercase tracking-widest">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="bg-[#1e232e] rounded-2xl border border-gray-800 border-dashed p-10 text-center">
                                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">No reviews yet.</p>
                            </div>
                        ) : (
                            reviews.map(review => (
                                <div key={review.id} className="bg-[#1e232e] p-6 rounded-2xl border border-gray-800 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                                            {review.profile?.avatar_url ? <img src={review.profile.avatar_url} className="w-full h-full object-cover" alt=""/> : <User className="w-5 h-5 text-gray-500 m-2.5"/>}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-white font-bold text-sm flex items-center gap-2">
                                                    {review.profile?.username || 'Verified User'}
                                                    <span className="text-[8px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20 uppercase tracking-widest font-black">Owner</span>
                                                </p>
                                                <p className="text-[10px] text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-0.5 bg-[#0b0e14] px-2 py-1 rounded-lg border border-gray-800">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-xs leading-relaxed">{review.comment}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
