import React, { useState } from 'react';
import { X, Zap, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';

export const ProductDetailsModal = ({ product, onClose, onAddToCart }: { product: Product, onClose: () => void, onAddToCart: (p: Product, qty: number) => void }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1e232e] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col md:flex-row relative animate-slide-up max-h-[90vh] overflow-y-auto md:overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-3 bg-black/40 rounded-full text-white hover:bg-red-500 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/30">
                {product.category}
              </span>
              <span className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                {product.platform}
              </span>
            </div>
            <h2 className="text-4xl font-black text-white italic mb-6 leading-tight uppercase tracking-tighter">{product.name}</h2>
            <p className="text-gray-400 mb-10 leading-relaxed text-sm font-medium">
              {product.description || "Enhance your gaming journey with this premium digital asset. Safe delivery and satisfaction guaranteed."}
            </p>

            <div className="flex items-center justify-between mb-10 pb-10 border-b border-gray-800">
               <div>
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Unit Price</p>
                 <p className="text-4xl font-black text-yellow-400 italic tracking-tighter">{product.price.toFixed(2)} DH</p>
               </div>
               <div>
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Shipment</p>
                 <p className="text-sm font-black text-green-400 flex items-center gap-1 uppercase tracking-widest">
                   <Zap className="w-4 h-4" /> Ready
                 </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between bg-[#0b0e14] p-4 rounded-2xl border border-gray-800">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Select Qty</span>
                <div className="flex items-center gap-5">
                   <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1 hover:text-blue-400 transition">
                     <Minus className="w-6 h-6" />
                   </button>
                   <span className="text-2xl font-black text-white w-8 text-center">{quantity}</span>
                   <button onClick={() => setQuantity(q => q + 1)} className="p-1 hover:text-blue-400 transition">
                     <Plus className="w-6 h-6" />
                   </button>
                </div>
             </div>

             <button 
               onClick={() => { onAddToCart(product, quantity); onClose(); }}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-600/30 uppercase tracking-widest"
             >
               <ShoppingCart className="w-6 h-6" /> Add to Cart — {(product.price * quantity).toFixed(2)} DH
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};