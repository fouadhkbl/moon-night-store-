import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { Product } from '../../../types';
import { ShoppingCart, Plus } from 'lucide-react';

export const ShopGrid = ({ category, onProductClick }: { category: string | null, onProductClick: (p: Product) => void }) => {
   const [products, setProducts] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
     setIsLoading(true);
     let query = supabase.from('products').select('*');
     if (category) query = query.eq('category', category);
     query.then(({ data }) => { 
       if (data) setProducts(data); 
       setIsLoading(false);
     }); 
   }, [category]);

   if (isLoading) return (
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[1,2,3,4,5,6,7,8].map(n => (
          <div key={n} className="bg-[#1e232e] rounded-[2.5rem] h-80 md:h-[30rem] animate-pulse border border-gray-800"></div>
        ))}
     </div>
   );

   if (products.length === 0) return (
     <div className="py-40 text-center">
       <div className="bg-[#1e232e] w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 text-gray-800 border border-gray-800 shadow-3xl">
         <ShoppingCart className="w-16 h-16" />
       </div>
       <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">No Supply Found</h3>
       <p className="text-gray-600 text-[11px] font-black uppercase tracking-[0.4em] mt-4"> restocking system scheduled.</p>
     </div>
   );

   return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
         {products.map(p => (
             <div 
               key={p.id} 
               className="bg-[#1e232e] rounded-2xl overflow-hidden border border-gray-800 hover:border-blue-500/60 transition-all duration-500 cursor-pointer group shadow-2xl flex flex-col h-full active:scale-95" 
               onClick={() => onProductClick(p)}
             >
                <div className="relative aspect-[3/4] overflow-hidden">
                   <img 
                    src={p.image_url} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 brightness-75 group-hover:brightness-100" 
                    alt={p.name} 
                   />
                   <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xl px-2.5 py-1 rounded-lg text-[8px] font-black text-white border border-white/10 uppercase tracking-widest shadow-2xl">
                      {p.platform.toUpperCase()}
                   </div>
                   {p.is_trending && (
                     <div className="absolute top-3 right-3 bg-blue-600 px-2.5 py-1 rounded-lg text-[8px] font-black text-white border border-blue-400 uppercase tracking-widest shadow-2xl animate-pulse">
                       HOT
                     </div>
                   )}
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#1e232e] to-[#151a23]">
                   <div>
                     <h3 className="font-black text-white text-sm md:text-base truncate group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter mb-1 leading-none">{p.name}</h3>
                     <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em]">{p.category.toUpperCase()}</p>
                   </div>
                   <div className="flex items-center justify-between mt-4">
                      <div className="text-yellow-400 font-black italic text-xl md:text-2xl tracking-tighter leading-none">{p.price.toFixed(2)} <span className="text-[10px] md:text-xs">DH</span></div>
                      <div className="bg-blue-600/10 p-2.5 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl active:scale-90">
                        <Plus className="w-4 h-4" />
                      </div>
                   </div>
                </div>
             </div>
         ))}
      </div>
   );
};