
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Minus, Plus, ShoppingCart, Globe, Star, MessageSquare, User, Lock, ArrowRight, Package, Share2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1e232e] w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative animate-slide-up max-h-[85vh] flex flex-col">
        <button onClick={handleShare} className="absolute top-3 right-12 z-30 p-1.5 bg-black/50 rounded-lg text-white hover:bg-blue-500 transition-colors border border-white/10"><Share2 className="w-4 h-4" /></button>
        <button onClick={onClose} className="absolute top-3 right-3 z-30 p-1.5 bg-black/50 rounded-lg text-white hover:bg-red-500 transition-colors border border-white/10"><X className="w-4 h-4" /></button>

        <div ref={scrollRef} className="overflow-y-auto custom-scrollbar flex-1">
            <div className="flex flex-col md:flex-row border-b border-gray-800">
               <div className="w-full md:w-5/12 bg-[#0b0e14] flex items-center justify-center p-6">
                   <img src={product.image_url} className="max-h-[240px] object-contain" alt="" />
               </div>
               <div className="w-full md:w-7/12 p-6 flex flex-col">
                    <div className="flex gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 text-[8px] font-black uppercase border border-blue-600/20">{product.category}</span>
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-500 text-[8px] font-black uppercase">{product.platform}</span>
                    </div>
                    <h2 className="text-xl font-black text-white italic mb-2 uppercase leading-tight">{product.name}</h2>
                    <p className="text-gray-500 text-[10px] leading-relaxed mb-6 font-medium">{product.description || "Secure delivery."}</p>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                       <div>
                         <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Price</p>
                         <p className="text-2xl font-black text-yellow-400 italic">{product.price.toFixed(2)} DH</p>
                       </div>
                       <div>
                         <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Status</p>
                         <p className="text-[9px] font-black text-green-400 flex items-center gap-1 uppercase bg-green-900/10 w-fit px-2 py-0.5 rounded border border-green-500/20"><Zap className="w-3 h-3" /> Instant</p>
                       </div>
                    </div>
                    <div className="mt-auto space-y-3">
                       <div className="flex items-center justify-between bg-[#0b0e14] p-2 rounded-xl border border-gray-800">
                          <span className="text-[9px] font-black text-gray-600 uppercase ml-2">Qty</span>
                          <div className="flex items-center gap-3">
                             <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-white"><Minus className="w-3 h-3" /></button>
                             <span className="text-sm font-black text-white w-4 text-center">{quantity}</span>
                             <button onClick={() => setQuantity(q => q + 1)} className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-white"><Plus className="w-3 h-3" /></button>
                          </div>
                       </div>
                       <button onClick={() => { onAddToCart(product, quantity); onClose(); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all shadow-xl">
                         <ShoppingCart className="w-4 h-4" /> Add to Cart — {(product.price * quantity).toFixed(2)} DH
                       </button>
                    </div>
               </div>
            </div>

            <div className="p-6 bg-[#151a23]">
                <h3 className="text-sm font-black text-white italic uppercase mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-500" /> Reviews ({reviews.length})</h3>
                {loadingReviews ? <div className="text-center py-4 text-[9px] text-gray-500 font-bold uppercase">Loading...</div> : 
                 reviews.length === 0 ? <p className="text-[9px] text-gray-600 uppercase font-bold text-center py-4">No reviews yet.</p> :
                 reviews.map(r => (
                     <div key={r.id} className="bg-[#1e232e] p-3 rounded-lg border border-gray-800 mb-2 flex gap-3">
                         <div className="w-7 h-7 rounded-full bg-gray-800 shrink-0 overflow-hidden"><img src={r.profile?.avatar_url} className="w-full h-full object-cover" alt=""/></div>
                         <div className="flex-1">
                             <p className="text-white font-bold text-[10px]">{r.profile?.username || 'Gamer'}</p>
                             <p className="text-gray-400 text-[10px]">{r.comment}</p>
                         </div>
                         <div className="flex gap-0.5"><Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> <span className="text-[9px] font-bold text-white">{r.rating}</span></div>
                     </div>
                 ))
                }
            </div>
        </div>
      </div>
    </div>
  );
};
