
import React, { useState, useEffect, useRef } from 'react';
// Added Loader2 to the imports from lucide-react
import { X, Zap, Minus, Plus, ShoppingCart, Globe, Star, MessageSquare, User, Lock, ArrowRight, Package, Share2, Loader2 } from 'lucide-react';
import { Product, Review, Profile } from '../../types';
import { supabase } from '../../supabaseClient';

export const ProductDetailsModal = ({ product, onClose, onAddToCart, onSwitchProduct, addToast }: { 
    product: Product, onClose: () => void, onAddToCart: (p: Product, qty: number) => void, onSwitchProduct: (p: Product) => void, addToast: any
}) => {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
      const fetchReviews = async () => {
          setLoadingReviews(true);
          const { data } = await supabase.from('reviews').select('*, profile:profiles(*)').eq('product_id', product.id).order('created_at', { ascending: false });
          if (data) setReviews(data);
          setLoadingReviews(false);
      };
      fetchReviews();
  }, [product.id]);

  const handleShare = () => {
      const url = `${window.location.origin}/#product=${product.id}`;
      navigator.clipboard.writeText(url).then(() => addToast('Copied', 'Product link copied!', 'success'));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1e232e] w-full max-w-3xl sm:rounded-2xl overflow-hidden shadow-2xl border-x sm:border border-gray-800 relative animate-slide-up h-full sm:h-auto sm:max-h-[85vh] flex flex-col">
        <button onClick={handleShare} className="absolute top-4 right-14 z-30 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-blue-500 transition-colors border border-white/10"><Share2 className="w-5 h-5" /></button>
        <button onClick={onClose} className="absolute top-4 right-4 z-30 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-red-500 transition-colors border border-white/10"><X className="w-5 h-5" /></button>

        <div ref={scrollRef} className="overflow-y-auto custom-scrollbar flex-1">
            <div className="flex flex-col md:flex-row border-b border-gray-800">
               {/* Larger Image Section for Mobile */}
               <div className="w-full md:w-5/12 bg-[#0b0e14] flex items-center justify-center p-4 sm:p-6 min-h-[350px] sm:min-h-0">
                   <img 
                    src={product.image_url} 
                    className="w-full h-full max-h-[400px] md:max-h-[300px] object-contain drop-shadow-2xl" 
                    alt={product.name} 
                   />
               </div>
               <div className="w-full md:w-7/12 p-6 flex flex-col bg-[#1e232e]">
                    <div className="flex gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 text-[8px] font-black uppercase border border-blue-600/20">{product.category}</span>
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-500 text-[8px] font-black uppercase">{product.platform}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white italic mb-2 uppercase leading-tight tracking-tighter">{product.name}</h2>
                    <p className="text-gray-500 text-xs leading-relaxed mb-6 font-medium">{product.description || "Premium digital asset with secure instant delivery via Moon Night protocol."}</p>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div>
                         <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Price</p>
                         <p className="text-3xl font-black text-yellow-400 italic tracking-tighter">{product.price.toFixed(2)} DH</p>
                       </div>
                       <div>
                         <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">System Status</p>
                         <p className="text-[10px] font-black text-green-400 flex items-center gap-1.5 uppercase bg-green-900/10 w-fit px-3 py-1 rounded-lg border border-green-500/20"><Zap className="w-3.5 h-3.5 fill-current" /> Instant Link</p>
                       </div>
                    </div>
                    <div className="mt-auto space-y-4">
                       <div className="flex items-center justify-between bg-[#0b0e14] p-3 rounded-2xl border border-gray-800">
                          <span className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Quantity</span>
                          <div className="flex items-center gap-4">
                             <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"><Minus className="w-4 h-4" /></button>
                             <span className="text-lg font-black text-white w-6 text-center italic">{quantity}</span>
                             <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"><Plus className="w-4 h-4" /></button>
                          </div>
                       </div>
                       <button onClick={() => { onAddToCart(product, quantity); onClose(); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_40px_rgba(37,99,235,0.4)] active:scale-95">
                         <ShoppingCart className="w-5 h-5" /> Sync to Cart — {(product.price * quantity).toFixed(2)} DH
                       </button>
                    </div>
               </div>
            </div>

            <div className="p-8 bg-[#151a23]">
                <h3 className="text-base font-black text-white italic uppercase mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    Market Feedback ({reviews.length})
                </h3>
                {/* Fixed: Loader2 is now imported above */}
                {loadingReviews ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> : 
                 reviews.length === 0 ? <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest text-center py-10 bg-[#0b0e14]/30 rounded-[2rem] border border-dashed border-gray-800">Operational: No logs found.</p> :
                 <div className="space-y-3">
                    {reviews.map(r => (
                        <div key={r.id} className="bg-[#1e232e] p-5 rounded-2xl border border-gray-800 flex gap-4 transition-all hover:border-white/10 group">
                            <div className="w-10 h-10 rounded-xl bg-gray-800 shrink-0 overflow-hidden border border-white/5">
                                <img src={r.profile?.avatar_url} className="w-full h-full object-cover" alt=""/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-white font-black text-xs uppercase italic truncate">{r.profile?.username || 'Verified User'}</p>
                                    <div className="flex gap-0.5"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> <span className="text-[10px] font-black text-white">{r.rating}</span></div>
                                </div>
                                <p className="text-gray-400 text-xs font-medium leading-relaxed">{r.comment}</p>
                            </div>
                        </div>
                    ))}
                 </div>
                }
            </div>
        </div>
      </div>
    </div>
  );
};
