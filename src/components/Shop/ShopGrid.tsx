
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Product } from '../../types';
import { Plus, SearchX, RotateCcw, ShoppingCart, Zap, Loader2, Scan } from 'lucide-react';

export const ShopGrid = ({ category, searchQuery, onProductClick, language }: { category: string | null, searchQuery: string, onProductClick: (p: Product) => void, language: 'en' | 'fr' }) => {
   const [products, setProducts] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [sortOption, setSortOption] = useState<string>('featured');

   useEffect(() => {
     const fetchProducts = async () => {
         setIsLoading(true);
         // Visual delay for polished feel
         await new Promise(r => setTimeout(r, 400));

         let query = supabase.from('products').select('*').eq('is_hidden', false);
         
         if (category) {
             query = query.ilike('category', category);
         }
         
         if (searchQuery) {
             query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
         }

         const { data, error } = await query;
         
         if (error) {
             console.error("Shop Error:", error);
             setProducts([]);
         } else if (data) {
             let sortedData = [...data];
             if (sortOption === 'price-asc') sortedData.sort((a, b) => a.price - b.price);
             else if (sortOption === 'price-desc') sortedData.sort((a, b) => b.price - a.price);
             else sortedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
             setProducts(sortedData);
         } 
         setIsLoading(false);
     };

     fetchProducts();
   }, [category, searchQuery, sortOption]);

   const SkeletonCard = () => (
    <div className="bg-[#151a23] rounded-[1.5rem] border border-white/5 overflow-hidden flex flex-col animate-pulse">
        <div className="aspect-[2/3] bg-gray-800/50"></div>
        <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mt-4"></div>
        </div>
    </div>
   );

   if (!isLoading && products.length === 0) {
       return (
           <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in bg-[#1e232e]/30 rounded-[3rem] border border-white/5 shadow-2xl">
               <div className="w-24 h-24 bg-[#1e232e] rounded-3xl flex items-center justify-center mb-6 border border-gray-800 relative group overflow-hidden">
                   <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                   <SearchX className="w-10 h-10 text-gray-600 relative z-10" />
               </div>
               <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">No Items Found</h3>
               <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 max-w-xs leading-relaxed">
                   {category ? `No items found in the ${category} category.` : "No items matched your search query."}
               </p>
               <button 
                  onClick={() => window.location.reload()} 
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl border border-blue-500/20 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-600/20"
               >
                  <RotateCcw className="w-4 h-4" /> Reset Shop
               </button>
           </div>
       );
   }

   return (
      <div className="animate-slide-up relative">
          {/* LOADING OVERLAY */}
          {isLoading && (
              <div className="absolute inset-x-0 -top-8 flex justify-center z-20">
                  <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-2xl">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading Shop...
                  </div>
              </div>
          )}

          <div className="flex justify-between items-end mb-8">
              <div>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Market Analysis</p>
                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                      {isLoading ? 'Updating items...' : `${products.length} Items found`}
                  </span>
              </div>
              <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                      <Scan className="w-3 h-3 text-gray-500" />
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">High Def Grid</span>
                  </div>
                  <select 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)} 
                    className="bg-[#151a23] border border-white/10 text-gray-400 text-[9px] font-black uppercase py-2.5 px-4 rounded-xl outline-none cursor-pointer hover:border-blue-500 transition-all shadow-xl"
                  >
                      <option value="featured">Sort by Newest</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                  </select>
              </div>
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-opacity duration-500 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
              {isLoading ? (
                  [1,2,3,4,5,6,7,8,9,10,11,12].map(n => <SkeletonCard key={n} />)
              ) : (
                  products.map(p => (
                      <div key={p.id} onClick={() => onProductClick(p)} className="bg-[#151a23] rounded-[1.5rem] border border-white/5 overflow-hidden cursor-pointer group hover:border-blue-500/50 transition-all flex flex-col shadow-xl hover:-translate-y-2 duration-500">
                          <div className="aspect-[2/3] relative overflow-hidden bg-black">
                              <img src={p.image_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[0.8s]" alt="" />
                              
                              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                {p.is_vip && <div className="bg-yellow-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg">ELITE</div>}
                                {p.is_trending && <div className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1"><Zap className="w-2 h-2 fill-current" /> HOT</div>}
                              </div>

                              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/40 to-transparent backdrop-blur-[2px] translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                  <p className="text-[7px] text-blue-400 font-bold uppercase tracking-widest mb-1 opacity-80">{p.category}</p>
                                  <h3 className="text-white font-black text-[11px] truncate uppercase leading-tight mb-2">{p.name}</h3>
                                  <div className="flex justify-between items-center mt-1">
                                      <span className="text-yellow-400 font-black italic text-sm tracking-tighter">{p.price.toFixed(2)} DH</span>
                                      <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center text-white transition-all scale-0 group-hover:scale-110 origin-bottom shadow-lg">
                                          <Plus className="w-3.5 h-3.5" />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
   );
};
